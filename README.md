# LookBook API (Swap Studio)

RESTful backend service for **LookBook (Swap Studio)**, a peer-to-peer clothing exchange and administrative inventory management platform. Built with Node.js, Express 5, and MySQL (Aiven Cloud or local), it enforces transactional swap processing, pessimistic concurrency locking (`FOR UPDATE`), automated item status synchronization, cascading data cleanup, and strict input validation.

> **Frontend Repository:** Looking for the React + Vite client application? Check out [lookbook-frontend](https://github.com/filos93/lookbook-frontend).

---

## 🚀 Tech Stack

- **Runtime & Framework:** Node.js, Express 5 (`express`, `cors`, `dotenv`)
- **Database:** MySQL (`mysql2/promise` with connection pooling, transaction isolation, and dynamic SSL CA verification for Aiven Cloud)
- **Validation & Security:** Regex input sanitization, parameterized SQL queries, fail-fast startup validation, centralized error sanitization
- **Testing & Quality:** Mocha, Chai, and Supertest live MySQL integration test suite

---

## 🛠️ Project Structure

```text
lookbook-api/
├── config/
│   ├── db.js            # MySQL connection pool, SSL CA setup, and fail-fast env validation
│   └── init-db.js       # Database schema & seed initialization script with production guard
├── db/
│   ├── schema.sql       # Relational tables, foreign keys, and indexes
│   └── seeds.sql        # Initial sample users, products, photos, and swaps
├── routes/
│   ├── products.js      # Product CRUD, JSON_ARRAYAGG photos, and status immutability guards
│   ├── swap_orders.js   # Atomic swap creation/update/deletion with FOR UPDATE row locks
│   └── users.js         # User CRUD and cascading swap/product cleanup
├── tests/
│   └── swap_orders.tests.js # Live MySQL integration tests (concurrency, locks, validation)
├── .env.example         # Environment variable template
├── .gitignore           # Git untracked rules
├── package.json         # Dependencies and npm scripts
├── README.md            # Repository documentation & setup guide
└── server.js            # Express application entry point & global middleware
```

---

## 🏁 Quick Start

### 1. Requirements

- Node.js (v18+ recommended)
- MySQL (local instance or Aiven Cloud MySQL URI)

### 2. Environment Configuration

Copy .env.example to .env in the repository root and configure your database and CORS settings:

```bash
cp .env.example .env
```

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173
NODE_ENV=development

# Aiven Cloud MySQL (Default)
DB_HOST=your_aiven_host
DB_PORT=your_aiven_port
DB_USER=your_aiven_user
DB_PASSWORD=your_aiven_password
DB_NAME=defaultdb
DB_SSL=REQUIRED
DB_SSL_CA="./config/ca.pem"
```

### 3. Installation, Database Setup & Server Start

```bash
# Install dependencies
npm install

# Initialize schema and seed data
npm run init-db

# Start development server (with auto-reload)
npm run dev

# Or start in standard mode
npm start
```

The Express API server will run on http://localhost:3000 (GET / returns a JSON health check).

---

## 🔌 API Endpoints

### 👤 Users (`/api/users`)

| Method | Endpoint | Description |
|----------|----------|----------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user details and listed products |
| POST | `/api/users` | Register a new user (validates name, surname, unique email) |
| PUT | `/api/users/:id` | Update user details |
| DELETE | `/api/users/:id` | Cascading delete user (cancels active swaps and restores item statuses) |

### 🧥 Products (`/api/products`)

| Method | Endpoint | Description |
|----------|----------|----------|
| GET | `/api/products` | List all products with owners and aggregated photos (JSON_ARRAYAGG) |
| POST | `/api/products` | Create a new item listing |
| PUT | `/api/products/:id` | Update item details (locks row FOR UPDATE, ignores manual status overrides, blocked if swapped) |
| DELETE | `/api/products/:id` | Remove product (locks row FOR UPDATE, blocked if involved in an active swap) |

### 🔁 Swap Orders (`/api/swaps`)

| Method | Endpoint | Description |
|----------|----------|----------|
| GET | `/api/swaps` | Fetch swap orders (supports filters: `date`, `startDate`, `endDate`, `productId`) |
| POST | `/api/swaps` | Create atomic 2-user, 2-product swap with pessimistic row locks (FOR UPDATE) to prevent race conditions |
| PUT | `/api/swaps/:id` | Atomically update users and items involved in a swap (requires complete user_ids and product_ids payload) |
| DELETE | `/api/swaps/:id` | Delete swap order and restore item statuses to `available` |

---

## 🧪 Testing & Security Audits

Integration tests execute directly against a dedicated MySQL test database (lookbook_test) to verify real transactional behavior: concurrent swap race conditions (FOR UPDATE row locks), swapped item protection on product updates/deletes, 400 Bad Request rejection on manual status overrides, and strict payload validation on swap updates.

1. Create an isolated .env.test file in the repository root with the same connection credentials as .env and a separate test database name:

```
DB_HOST=your_aiven_host
DB_PORT=your_aiven_port
DB_USER=your_aiven_user
DB_PASSWORD=your_aiven_password
DB_NAME=lookbook_test
DB_SSL=REQUIRED
DB_SSL_CA="./config/ca.pem"
```

2. Initialize the schema on the test database and run the test suite:

```bash
NODE_ENV=test npm run init-db
npm test
npm audit
```

## ✅ Core Features

- **RESTful API Architecture:** Decoupled backend service with configurable CORS (`CORS_ORIGIN`), JSON health check (`GET /`), and standardized JSON error responses
- **Transactional Swap Processing:** Atomic 2-user, 2-product swap creation, updates, and deletions protected by pessimistic row locking (`SELECT ... FOR UPDATE`)
- **Strict Status Immutability Guards:** Item `status` (`available` / `swapped`) is derived exclusively from swap lifecycle events; manual overrides via `PUT /api/products/:id` are explicitly rejected (`400 Bad Request`)
- **Batched Query Execution & SQL Aggregation:** Eliminates N+1 query bottlenecks on swap retrieval and aggregates product photos via SQL `JSON_ARRAYAGG`
- **Cascading Data Cleanup:** Deleting a user atomically cancels active swaps, removes owned items, and restores counterparty products to `available`
- **Verified SSL Connection Pooling:** MySQL (`mysql2/promise`) pool with Aiven SSL CA certificate verification and fail-fast startup environment validation
- **Input Validation & Error Sanitization:** Regex input sanitization, parameterized SQL queries, and centralized Express error middleware preventing internal DB leaks
- **Live MySQL Integration Testing:** Automated Mocha, Chai, and Supertest suite verifying concurrency, row locks, and validation rules against an isolated test database

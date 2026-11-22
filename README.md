# LookBook API (Swap Studio)

RESTful backend service powering **LookBook (Swap Studio)**, a peer-to-peer clothing exchange and inventory management platform.

Built with **Node.js**, **Express 5**, and **MySQL**, the API provides secure and transactional management of users, garments, and swap operations. The application implements pessimistic locking (`FOR UPDATE`), automated inventory status synchronization, cascading cleanup operations, centralized validation, and integration testing against a real MySQL database.

> **Frontend Repository:** Looking for the React + Vite client application? Check out [lookbook-frontend](https://github.com/filos93/lookbook-frontend).

---

## 🚀 Tech Stack

### Backend

- Node.js
- Express 5
- CORS
- dotenv

### Database

- MySQL (`mysql2/promise`)
- Connection pooling
- Transactions
- Row-level locking (`FOR UPDATE`)
- Aiven Cloud MySQL support
- SSL certificate validation

### Testing

- Mocha
- Chai
- Supertest

### Security & Validation

- Parameterized SQL queries
- Input validation
- Regex-based sanitization
- Centralized error handling
- Fail-fast environment validation

---

## 🏗️ Architecture

```text
┌────────────────────────────────────┐
│        HTTP Client (JSON)          │
└─────────────────┬──────────────────┘
                  │ REST / HTTPS
                  ▼
┌────────────────────────────────────┐
│     Express 5 & Middleware         │
│  (CORS, JSON Parser, Error Handler)│
└─────────────────┬──────────────────┘
                  │
                  ▼
┌────────────────────────────────────┐
│    REST Routes & Validation        │
│ (/api/users, /products, /swaps)    │
└─────────────────┬──────────────────┘
                  │ ACID Tx &
                  │ FOR UPDATE Locks
                  ▼
┌────────────────────────────────────┐
│          MySQL Database            │
│      (Aiven Cloud / Local)         │
└────────────────────────────────────┘
```

---

## 🛠️ Project Structure

```text
lookbook-api/
├── config/
│   ├── db.js
│   └── init-db.js
├── db/
│   ├── schema.sql
│   └── seeds.sql
├── routes/
│   ├── users.js
│   ├── products.js
│   └── swap_orders.js
├── tests/
│   └── swap_orders.tests.js
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── server.js
```

### Key Components

| Component | Purpose |
|------------|------------|
| `config/db.js` | MySQL connection pool and SSL configuration |
| `config/init-db.js` | Database initialization and seed loading |
| `routes/users.js` | User CRUD operations |
| `routes/products.js` | Product CRUD operations and status validation |
| `routes/swap_orders.js` | Transactional swap management |
| `tests/swap_orders.tests.js` | Integration tests for locking, validation, and transactions |
| `server.js` | Express application entry point |

---

## 🏁 Quick Start

### 1. Requirements

- Node.js 18+ (recommended)
- MySQL server (local or cloud-hosted)

### 2. Clone the Repository

```bash
git clone https://github.com/filos93/lookbook-api.git

cd lookbook-api
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file from the provided template:

```bash
cp .env.example .env
```

Example configuration:

```env
PORT=3000
CORS_ORIGIN=http://localhost:5173

NODE_ENV=development

DB_HOST=your_host
DB_PORT=your_aiven_port_here
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=defaultdb

DB_SSL=REQUIRED
DB_SSL_CA=./config/ca.pem
```

### 5. Initialize the Database

```bash
npm run init-db
```

This command:

- Creates database tables
- Adds indexes and constraints
- Loads sample data

### 6. Start the Server

Development mode:

```bash
npm run dev
```

Production mode:

```bash
npm start
```

The API will be available at:

```text
http://localhost:3000
```

---

## 🔍 Health Check

Verify the API is running:

```http
GET /
```

Example response:

```json
{
  "status": "ok",
  "service": "LookBook REST API"
}
```

---

## 🔌 API Endpoints

### 👤 Users

Base route:

```text
/api/users
```

| Method | Endpoint | Description |
|----------|----------|----------|
| GET | `/api/users` | Retrieve all users |
| GET | `/api/users/:id` | Retrieve user details and owned products |
| POST | `/api/users` | Create a new user |
| PUT | `/api/users/:id` | Update user information |
| DELETE | `/api/users/:id` | Delete a user and clean related records |

---

### 🧥 Products

Base route:

```text
/api/products
```

| Method | Endpoint | Description |
|----------|----------|----------|
| GET | `/api/products` | Retrieve products with owners and photos |
| POST | `/api/products` | Create a new product |
| PUT | `/api/products/:id` | Update product details (rejects manual status edits with 400 Bad Request) |
| DELETE | `/api/products/:id` | Delete an available product |

---

### 🔁 Swaps

Base route:

```text
/api/swaps
```

| Method | Endpoint | Description |
|----------|----------|----------|
| GET | `/api/swaps` | Retrieve swaps with optional filters |
| POST | `/api/swaps` | Create a new swap |
| PUT | `/api/swaps/:id` | Update swap participants and products |
| DELETE | `/api/swaps/:id` | Delete a swap and restore product availability |

---

## 📦 Example Request

Create a swap between two users:

### Request

```http
POST /api/swaps
Content-Type: application/json
```

```json
{
  "user1_id": 1,
  "user2_id": 2,
  "product1_id": 3,
  "product2_id": 7
}
```

### Response

```json
{
  "message": "Swap created successfully",
  "swapId": 15
}
```

---

## 🔒 Business Rules

The API enforces several consistency rules:

### Product Status

Product status cannot be edited directly.

Status is automatically managed based on swap lifecycle events:

| Event | Result |
|---------|---------|
| Product created | `available` |
| Swap created | `swapped` |
| Swap updated | Status recalculated automatically |
| Swap deleted | `available` |

---

### Swap Validation

The API rejects swaps when:

- Both products belong to the same user
- A product is already swapped
- Products do not exist
- Users do not exist
- Required IDs are missing
- Invalid payload values are supplied

---

### Concurrency Protection

Swap operations use database transactions and pessimistic locking:

```sql
SELECT ...
FOR UPDATE
```

This prevents race conditions where multiple requests attempt to swap the same garment simultaneously.

---

## 🧪 Testing

Integration tests run against a dedicated test database.

### Test Environment

Create a separate `.env.test` file:

```env
DB_HOST=your_host
DB_PORT=your_aiven_port_here
DB_USER=your_user
DB_PASSWORD=your_password
DB_NAME=lookbook_test
DB_SSL=REQUIRED
DB_SSL_CA=./config/ca.pem
```

### Initialize Test Database

```bash
NODE_ENV=test npm run init-db
```

### Run Tests

```bash
npm test
```

### Security Audit

```bash
npm audit
```

---

## ✅ Core Features

- **Transactional Swap Engine**
Swap creation, updates, and deletions execute inside MySQL transactions to ensure consistency and rollback safety.

- **Pessimistic Locking**
Uses `SELECT ... FOR UPDATE` to prevent concurrent modifications of the same products.

- **Status Synchronization**
Product availability is derived automatically from swap activity and cannot be manually overridden.

- **Cascading Cleanup**
Deleting a user automatically: Removes owned products; Resolves associated swaps; Restores affected product availability.

- **Efficient Data Retrieval**
Uses SQL aggregation (`JSON_ARRAYAGG`) and optimized queries to minimize database round-trips.

- **Secure Database Access**
Supports both local MySQL and Aiven Cloud deployments with SSL certificate validation.

- **Input Validation**
Validates emails, names, prices, identifiers, and business rules before processing requests.

- **Centralized Error Handling**
Returns consistent JSON responses while preventing exposure of internal database details.

- **Automated Integration Testing**
Mocha, Chai, and Supertest verify: Swap transactions; Concurrency protection; Validation rules; Status immutability; API response behavior.

---

## 📄 License

This project is released under the MIT License.

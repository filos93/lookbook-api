# 🧵 LookBook - Swap Studio Project Overview

## 1. 📌 Project Summary
LookBook (Swap Studio) is a full-stack administrative management console and back-office dashboard for inventory control, user administration, and peer-to-peer clothing swap orchestration. Designed as an operational studio and testing interface, it allows administrators to manage user profiles, catalog clothing items with photos and pricing, and execute, filter, or revise balanced 2-person clothing swaps across the platform.

---

## 2. 🛠️ Tech Stack & Environment
* **Frontend:** React (Vite SPA), Tailwind CSS (Dark Mode theme), Custom Modals (No native browser popups).
* **Backend:** Node.js, Express (RESTful architecture).
* **Database:** MySQL (Hosted on Aiven Cloud / Local fallback), managed with `mysql2/promise` connection pool.
* **Database Management:** `schema.sql`, `migrations.sql`, and `init-db.js` for table setup and seeding.

---

## 3. 🗄️ Database Architecture & Schema
* **`users`**: `id`, `name`, `surname`, `email` (UNIQUE).
* **`products`**: `id`, `user_id` (FK), `name`, `price`, `status` (`'available'` | `'swapped'`), `photos` (JSON array or URL string).
* **`swap_orders`**: `id`, `created_at`.
* **`swap_order_users`**: Pivot table (`order_id`, `user_id`).
* **`swap_order_products`**: Pivot table (`order_id`, `product_id`).

> **Data Integrity Rules:** `ON DELETE CASCADE` is enforced on foreign keys. Deleting a user or product automatically cleans up associated pivot entries.

---

## 4. 🔌 REST API Endpoints Summary

### Users (`/api/users`)
* `GET /api/users` - List all users.
* `POST /api/users` - Create a user.
* `PUT /api/users/:id` - Update user details.
* `DELETE /api/users/:id` - Delete user and cascade products/swaps.

### Products (`/api/products`)
* `GET /api/products` - List all products with owner information.
* `POST /api/products` - Create a product (`status` defaults to `'available'`).
* `PUT /api/products/:id` - Update product details.
* `DELETE /api/products/:id` - Delete product.

### Swap Orders (`/api/swaps`)
* `GET /api/swaps` - List swaps. Supports query params: `startDate`, `endDate`, `date`, `productId`.
* `POST /api/swaps` - Create a swap (Requires exactly 2 distinct users and 2 distinct available products).
* `PUT /api/swaps/:id` - Edit swap participants and items.
* `DELETE /api/swaps/:id` - Cancel swap and reset item statuses to `'available'`.

---

## 5. 🔒 Security & Code Standards
1. **SQL Injection Prevention:** ALL MySQL queries MUST use **Prepared Statements** (`pool.execute(sql, [params])` or `?` placeholders).
2. **REST Compliance:** Plural endpoint names (`/api/users`), correct HTTP methods (`GET`, `POST`, `PUT`, `DELETE`), and standard HTTP status codes (`200`, `201`, `400`, `404`, `500`).
3. **UI/UX Standards:** Custom React overlay modals for confirmations (no native `window.alert()` or `window.confirm()`).

---

## 6. 📁 Key File Map
* `/server.js` - Main Express server entry point.
* `/config/db.js` - Aiven MySQL connection pool with SSL.
* `/routes/` - Express route controllers (`users.js`, `products.js`, `swap_orders.js`).
* `/src/App.jsx` - React root component and tab state management.
* `/src/api/client.js` - Fetch API abstraction layer.
* `/TODO.md` - Active milestone tracker.
* `/ARCHIVE.md` - Completed development history.
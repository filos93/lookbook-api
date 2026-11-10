# 📋 TODO List - Swap Studio Milestones

---

## 1. Concurrency & Data Integrity
- [ ] **Fix Race Condition in Swap Creation (`POST /api/swaps` & `PUT /api/swaps/:id`)**
  - [ ] Open the database transaction *before* executing item validation.
  - [ ] Update product validation queries to use `SELECT ... FOR UPDATE` (pessimistic locking) to block concurrent requests on the same products.
- [ ] **Prevent Orphan Product Statuses (`PUT /api/products/:id`)**
  - [ ] Remove `status` from the list of editable fields in `PUT /api/products/:id`.
  - [ ] Restrict product status mutations exclusively to transactional swap creation (`POST /api/swaps`) and swap deletion (`DELETE /api/swaps`).

## 2. API Logic & Performance Optimizations
- [ ] **Eliminate N+1 Queries in `GET /api/swaps`**
  - [ ] Replace per-order query loops ($2N+1$ queries) with batch queries using `WHERE order_id IN (...)` (or SQL `JOIN`s / `JSON_ARRAYAGG`).
  - [ ] Aggregate associated users and products in memory before returning the response.
- [ ] **Fix Payload Validation & Response in `PUT /api/swaps/:id`**
  - [ ] Add strict validation: return `400 Bad Request` if either required users or products arrays are missing.
  - [ ] Return the actual updated record from the database in the response, not the raw input body.

## 3. Security, Infrastructure & Configuration
- [ ] **Sanitize Error Handling (`server.js` & Routes)**
  - [ ] Delegate route-level `catch` blocks to the Express global error middleware via `next(err)`.
  - [ ] Prevent raw MySQL driver errors (`details: error.message`) from leaking to the client; return clean generic messages while logging full traces server-side.
- [ ] **Fix Product Photo Array Handling**
  - [ ] Replace SQL `GROUP_CONCAT` and string `split(',')` with `JSON_ARRAYAGG` to avoid string truncation (1024-char limit) and comma-parsing bugs in image URLs.
- [ ] **Harden Database Connection & Dependencies (`config/db.js`)**
  - [ ] Configure explicit Aiven SSL CA certificate verification (`ca` option) instead of `rejectUnauthorized: false`.
  - [ ] Remove default fallback credentials (`root` / `""`) to force fail-fast boot when `.env` configuration is missing.
  - [ ] Remove unused `multer` dependency from `package.json`.

## 4. Integration Testing
- [ ] **Add Database Integration Tests**
  - [ ] Write integration tests against a live test MySQL database (replacing pure `sinon` unit mocks).
  - [ ] Test concurrent swap requests targeting the same product (verify `FOR UPDATE` row lock behavior).
  - [ ] Test status protection on `PUT /api/products/:id`.
  - [ ] Test incomplete payload handling on `PUT /api/swaps/:id`.


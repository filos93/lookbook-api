# 📋 TODO List - Swap Studio Milestones

---

## 3. Security, Infrastructure & Configuration (Feedback 5-7)
- [ ] **Sanitize Error Handling (`server.js` & Routes)**
  - [ ] Delegate route-level `catch` blocks to the Express global error middleware via `next(err)`.
  - [ ] Prevent raw MySQL driver errors (`details: error.message`) from leaking to the client; return clean generic messages while logging full traces server-side.
- [ ] **Fix Product Photo Array Handling**
  - [ ] Replace SQL `GROUP_CONCAT` and string `split(',')` with `JSON_ARRAYAGG` to avoid string truncation (1024-char limit) and comma-parsing bugs in image URLs.
- [ ] **Harden Database Connection & Dependencies (`config/db.js`)**
  - [ ] Configure explicit Aiven SSL CA certificate verification (`ca` option) instead of `rejectUnauthorized: false`.
  - [ ] Remove default fallback credentials (`root` / `""`) to force fail-fast boot when `.env` configuration is missing.
  - [ ] Remove unused `multer` dependency from `package.json`.

---

## 4. Integration Testing (Feedback 8)
- [ ] **Add Database Integration Tests**
  - [ ] Write integration tests against a live test MySQL database (replacing pure `sinon` unit mocks).
  - [ ] Test concurrent swap requests targeting the same product (verify `FOR UPDATE` row lock behavior).
  - [ ] Test status protection on `PUT /api/products/:id`.
  - [ ] Test incomplete payload handling on `PUT /api/swaps/:id`.


# 📋 TODO List - Swap Studio Milestones

## 3. ✏️ Edit Swap Order (`PUT /api/swaps/:id`)
- [ ] **Backend (`server.js` / `routes/swaps.js`)**
  - [ ] Create the `PUT /api/swaps/:id` endpoint
  - [ ] Implement SQL transaction (`beginTransaction`, `commit`, `rollback`):
    - [ ] Reset previous swap items back to `'available'`
    - [ ] Clear pivot table relations `swap_order_products` and `swap_order_users` for that `order_id`
    - [ ] Insert new participants and items
    - [ ] Update the status of new items to `'swapped'`
- [ ] **Client API (`src/api/client.js`)**
  - [ ] Create the `updateSwap(swapId, payload)` function
- [ ] **Frontend (`SwapCard.jsx` & `App.jsx`)**
  - [ ] Add the "Edit" button on `SwapCard`
  - [ ] Create a modal or reuse `SwapRecord` to edit existing swaps

---

## 4. 📑 Delivery Compliance & Final Checklist
- [ ] **Migration File:** Create/duplicate `migrations.sql` in the project root from `schema.sql`
- [ ] **Security:** Verify that all MySQL queries use Prepared Statements (no direct string concatenation)
- [ ] **REST Standards:** Verify plural route naming and HTTP status codes (`200`, `201`, `400`, `404`, `500`)
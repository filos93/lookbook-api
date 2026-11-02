# 📋 TODO List - Swap Studio Milestones

## 2. Backend Validation & Security (`PUT /api/swaps/:id`)
- [ ] **Selection Constraints**: Verify that `EditSwapModal.jsx` strictly requires **exactly 2 users** and **exactly 2 items**.
- [ ] **Ownership Rules**: Confirm that items can only be assigned to their respective owners among the 2 selected participants (1 item per user).
- [ ] **Swapped Items Logic**:
  - [ ] Confirm items already in the swap currently being edited remain selectable.
  - [ ] Ensure items swapped in *other* orders are filtered out/hidden.
- [ ] **Transaction Integrity (Rollback)**: Send an invalid payload (e.g., 1 user or 3 items) and verify MySQL executes `rollback()`, keeping item statuses consistent (`available` vs `swapped`).

## 3. 📑 Delivery Compliance & Final Checklist
- [ ] **Migration File:** Create/duplicate `migrations.sql` in the project root from `schema.sql`
- [ ] **Security:** Verify that all MySQL queries use Prepared Statements (no direct string concatenation)
- [ ] **REST Standards:** Verify plural route naming and HTTP status codes (`200`, `201`, `400`, `404`, `500`)
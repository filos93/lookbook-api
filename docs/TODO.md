# 📋 TODO List - Swap Studio Milestones

# Frontend & Security Testing Checklist

## 1. Modular Deletion & Component Refactoring
- [ ] **`DeleteUserModal.jsx`**: Verify standalone modal renders properly and confirms deletion of specified user and associated records.
- [ ] **`DeleteProductModal.jsx`**: Verify standalone modal renders properly and confirms deletion of selected catalog item.
- [ ] **`DeleteSwapModal.jsx`**: Verify standalone modal renders properly, displays reference code (e.g., `#SWP-0001`), and restores items to `available` upon cancellation.
- [ ] **`App.jsx` Lightening**: Confirm `App.jsx` cleanly delegates state management to the 3 distinct deletion modals without inline confirmation duplication.
- [ ] **`Navbar.jsx`**:
  - [ ] Confirm action button order: `Add Item` ➔ `New Swap` ➔ `Create User`.
  - [ ] Verify search bar disables automatically with dynamic placeholder when switching to *Active Swaps* and *Users Directory* tabs.
- [ ] **`ProductCard.jsx`**: Ensure swapped items display only the `SWAPPED` badge and that the redundant "Unavailable" button is removed.
- [ ] **`SwapCard.jsx`**: Check that swap orders display formatted reference IDs (e.g., `#SWP-0001`).
- [ ] **`Users Directory`**: Ensure long email addresses use `truncate` to prevent layout overflow on action buttons (`✏️` and `✕`).

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
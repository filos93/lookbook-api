# 📜 Project Archive & Changelog

## [05/11/2026] GitHub Repository & Documentation
- [X] Check `.gitignore` rules for `node_modules`, build artifacts (`dist/`), and log files.
- [X] Commit updated test configurations for both frontend (Vitest) and backend (Mocha/Chai).
- [X] Update `README.md` with step-by-step setup and test execution commands (`npm test`).

---

## [04/11/2026] Security & Best Practices Checklist
- [X] **Secrets Management & Environment Audit:**
  - [X] Ensure `.env` is listed in `.gitignore` and confirm it is untracked by Git (`git status`).
  - [X] Update `.env.example` with all necessary sanitized placeholder keys.
  - [X] Verify the Aiven database connection in `config/db.js` retains `DB_SSL=true`.
- [X] **SQL Injection & Database Queries:**
  - [X] Confirm all MySQL queries in `backend/` use parameterized statements (`pool.execute(sql, [params])` / `connection.execute(sql, [params])`).
- [X] **Input Validation:**
  - [X] Validate request body data types (`user_ids`, `product_ids`) and format rules before initiating DB transactions.
- [X] **Error Sanitization & Code Cleanup:**
  - [X] Verify catch blocks return standard status codes and clean messages without exposing raw stack traces.
  - [X] Remove leftover `console.log` statements containing sensitive data, tokens, or credentials.
- [X] **Code Audit & Vulnerabilities:**
  - [X] Run `npm audit` in both `backend/` and `frontend/` directories to fix high/critical vulnerabilities.

## [04/11/2026] Canva Presentation Outline
- [X] **Slide 1: Title** — LookBook Swap Studio Overview
- [X] **Slide 2: Core Concept** — Sustainable Clothing Swap Platform & User Workflow
- [X] **Slide 3: Stack & Architecture** — React/Vite Frontend + Node.js/Express Backend + MySQL DB
- [X] **Rest of Slides**

## [04/11/2026] Backend/Frontend Testing
- [X] Run `npm test` inside `backend/`.
- [X] Run `npm test` inside `frontend/`.

---

## [02/11/2026] Modular Deletion & Component Refactoring
- [X] **`DeleteUserModal.jsx`**: Verify standalone modal renders properly and confirms deletion of specified user and associated records.
- [X] **`DeleteProductModal.jsx`**: Verify standalone modal renders properly and confirms deletion of selected catalog item.
- [X] **`DeleteSwapModal.jsx`**: Verify standalone modal renders properly, displays reference code (e.g., `#SWP-0001`), and restores items to `available` upon cancellation.
- [X] **`App.jsx` Lightening**: Confirm `App.jsx` cleanly delegates state management to the 3 distinct deletion modals without inline confirmation duplication.

---

## [01/11/2026] ✏️ Edit Swap Order (`PUT /api/swaps/:id`)
- [X] **Backend (`server.js` / `routes/swaps.js`)**
  - [X] Create the `PUT /api/swaps/:id` endpoint
  - [X] Implement SQL transaction (`beginTransaction`, `commit`, `rollback`):
    - [X] Reset previous swap items back to `'available'`
    - [X] Clear pivot table relations `swap_order_products` and `swap_order_users` for that `order_id`
    - [X] Insert new participants and items
    - [X] Update the status of new items to `'swapped'`
- [X] **Client API (`src/api/client.js`)**
  - [X] Create the `updateSwap(swapId, payload)` function
- [X] **Frontend (`SwapCard.jsx` & `App.jsx`)**
  - [X] Add the "Edit" button on `SwapCard`
  - [X] Create a modal or reuse `SwapRecord` to edit existing swaps

## [01/11/2026] 🔍 Swap Orders Filtering (Date and Products)
- [X] **Backend (`server.js` / `routes/swaps.js`)**
  - [X] Extend `GET /api/swaps` to accept query parameters `startDate`, `endDate`, and `productId`
  - [X] Build the dynamic MySQL query using **Prepared Statements** (`?`)
- [X] **Client API (`src/api/client.js`)**
  - [X] Update `fetchSwaps(filters)` to convert filters into `URLSearchParams`
- [X] **Frontend (`App.jsx`)**
  - [X] Add local state for filters (`filterStartDate`, `filterEndDate`, `filterProductId`)
  - [X] Create the filter bar (Date Pickers and Item Dropdown) inside the *Active Swaps* tab
  - [X] Call `loadSwaps()` on filter change

## [01/11/2026] 🎯 UX Fix: Item Pre-selection in Swap
- [X] **`App.jsx`**
  - [X] Add `preselectedProduct` state
  - [X] Implement `handleStartSwapWithProduct(product)` to set the item and open the Swap Builder
  - [X] Pass `preselectedProduct` as a prop to `<SwapRecord />`
- [X] **`SwapRecord.jsx`**
  - [X] Add `useEffect` listening to `preselectedProduct`
  - [X] Automatically populate `selectedProduct1` and its owner user (`selectedUser1`) on open
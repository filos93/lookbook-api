# 📜 Project Archive & Changelog

---

## [2026-11-01] ✏️ Edit Swap Order (`PUT /api/swaps/:id`)
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

## [2026-11-01] 🔍 Swap Orders Filtering (Date and Products)
- [X] **Backend (`server.js` / `routes/swaps.js`)**
  - [X] Extend `GET /api/swaps` to accept query parameters `startDate`, `endDate`, and `productId`
  - [X] Build the dynamic MySQL query using **Prepared Statements** (`?`)
- [X] **Client API (`src/api/client.js`)**
  - [X] Update `fetchSwaps(filters)` to convert filters into `URLSearchParams`
- [X] **Frontend (`App.jsx`)**
  - [X] Add local state for filters (`filterStartDate`, `filterEndDate`, `filterProductId`)
  - [X] Create the filter bar (Date Pickers and Item Dropdown) inside the *Active Swaps* tab
  - [X] Call `loadSwaps()` on filter change

## [2026-11-01] 🎯 UX Fix: Item Pre-selection in Swap
- [X] **`App.jsx`**
  - [X] Add `preselectedProduct` state
  - [X] Implement `handleStartSwapWithProduct(product)` to set the item and open the Swap Builder
  - [X] Pass `preselectedProduct` as a prop to `<SwapRecord />`
- [X] **`SwapRecord.jsx`**
  - [X] Add `useEffect` listening to `preselectedProduct`
  - [X] Automatically populate `selectedProduct1` and its owner user (`selectedUser1`) on open
# 📜 Project Archive & Changelog

## [2026-11-01] 🎯 UX Fix: Item Pre-selection in Swap
- [X] **`App.jsx`**
  - [X] Add `preselectedProduct` state
  - [X] Implement `handleStartSwapWithProduct(product)` to set the item and open the Swap Builder
  - [X] Pass `preselectedProduct` as a prop to `<SwapRecord />`
- [X] **`SwapRecord.jsx`**
  - [X] Add `useEffect` listening to `preselectedProduct`
  - [X] Automatically populate `selectedProduct1` and its owner user (`selectedUser1`) on open

---
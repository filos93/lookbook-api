# 📋 TODO List - Swap Studio Milestones

---

## 4. Integration Testing (Feedback 8)
- [ ] **Add Database Integration Tests**
  - [ ] Write integration tests against a live test MySQL database (replacing pure `sinon` unit mocks).
  - [ ] Test concurrent swap requests targeting the same product (verify `FOR UPDATE` row lock behavior).
  - [ ] Test status protection on `PUT /api/products/:id`.
  - [ ] Test incomplete payload handling on `PUT /api/swaps/:id`.


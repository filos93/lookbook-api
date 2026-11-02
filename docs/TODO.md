# 📋 TODO List - Swap Studio Milestones

## 1. UI Refactoring ("Scambia" Text Simplification)
- [ ] Audit button labels and modal text across `frontend/src/` components.
- [ ] Simplify text strings for clarity and conciseness.
- [ ] Update UI query selectors in `frontend/src/__tests__/App.swaps.test.jsx`.
- [ ] Run `npm test` inside `frontend/` to ensure all Vitest integration tests pass.

---

## 2. Security & Best Practices Checklist
- [ ] **SQL Injection:** Confirm all MySQL queries in `backend/` use parameterized statements (`pool.execute(sql, [params])`).
- [ ] **Input Validation:** Validate request body data types (`user_ids`, `product_ids`) before DB transactions.
- [ ] **Error Sanitization:** Verify catch blocks return standard status codes/messages without exposing stack traces.
- [ ] **Secrets Management:** Ensure `.env` is listed in `.gitignore` and `.env.example` contains sanitized placeholder keys.

---

## 3. GitHub Repository & Documentation
- [ ] Check `.gitignore` rules for `node_modules`, build artifacts (`dist/`), and log files.
- [ ] Commit updated test configurations for both frontend (Vitest) and backend (Mocha/Chai).
- [ ] Update `README.md` with step-by-step setup and test execution commands (`npm test`).

---

## 4. Canva Presentation Outline
- [ ] **Slide 1: Title** — LookBook Swap Studio Overview
- [ ] **Slide 2: Core Concept** — Sustainable Clothing Swap Platform & User Workflow
- [ ] **Slide 3: Stack & Architecture** — React/Vite Frontend + Node.js/Express Backend + MySQL DB
- [ ] **Slide 4: Testing & Reliability** — Automated Integration Testing (Vitest + Mocha/Chai/Sinon)
- [ ] **Slide 5: Key Learnings & Next Steps** — Security enhancements, scalable state management, deployment
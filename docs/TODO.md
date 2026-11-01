# 📋 TODO List - Swap Studio Milestones

## 1. 🎯 UX Fix: Pre-selezione Prodotto nello Swap
- [ ] **`App.jsx`**
  - [ ] Aggiungere lo stato `preselectedProduct`
  - [ ] Implementare `handleStartSwapWithProduct(product)` per impostare il capo e aprire lo Swap Builder
  - [ ] Passare `preselectedProduct` come prop a `<SwapRecord />`
- [ ] **`SwapRecord.jsx`**
  - [ ] Aggiungere `useEffect` in ascolto su `preselectedProduct`
  - [ ] Popolare automaticamente `selectedProduct1` e l'utente proprietario (`selectedUser1`) all'apertura

---

## 2. 🔍 Filtraggio Ordini Swap (Data e Prodotti)
- [ ] **Backend (`server.js` / `routes/swaps.js`)**
  - [ ] Estendere `GET /api/swaps` per accettare i parametri query `startDate`, `endDate`, e `productId`
  - [ ] Costruire la query dinamica MySQL usando **Prepared Statements** (`?`)
- [ ] **Client API (`src/api/client.js`)**
  - [ ] Aggiornare `fetchSwaps(filters)` per convertire i filtri in `URLSearchParams`
- [ ] **Frontend (`App.jsx`)**
  - [ ] Aggiungere gli stati locale per i filtri (`filterStartDate`, `filterEndDate`, `filterProductId`)
  - [ ] Creare la barra di filtraggio (Date Pickers e Dropdown dei capi) nella tab *Active Swaps*
  - [ ] Richiamare `loadSwaps()` al cambio dei filtri

---

## 3. ✏️ Modifica Ordine Swap (`PUT /api/swaps/:id`)
- [ ] **Backend (`server.js` / `routes/swaps.js`)**
  - [ ] Creare l'endpoint `PUT /api/swaps/:id`
  - [ ] Implementare la transazione SQL (`beginTransaction`, `commit`, `rollback`):
    - [ ] Ripristinare a `'available'` i capi dello swap precedente
    - [ ] Svuotare le relazioni pivot `swap_order_products` e `swap_order_users` per quel `order_id`
    - [ ] Inserire i nuovi partecipanti e capi
    - [ ] Aggiornare lo stato dei nuovi capi a `'swapped'`
- [ ] **Client API (`src/api/client.js`)**
  - [ ] Creare la funzione `updateSwap(swapId, payload)`
- [ ] **Frontend (`SwapCard.jsx` & `App.jsx`)**
  - [ ] Aggiungere il bottone "Modifica" sulla `SwapCard`
  - [ ] Creare il modal o riutilizzare `SwapRecord` per la modifica degli swap esistenti

---

## 4. 📑 Conformità Consegna e Checklist Finale
- [ ] **File di Migrazione:** Creare/duplicare `migrations.sql` nella root del progetto partendo da `schema.sql`
- [ ] **Sicurezza:** Verificare che tutte le query MySQL usino Prepared Statements (nessuna concatenazione diretta di stringhe)
- [ ] **REST Standard:** Verificare naming rotte plurali e status code HTTP (`200`, `201`, `400`, `404`, `500`)
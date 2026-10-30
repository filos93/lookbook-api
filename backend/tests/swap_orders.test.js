const request = require('supertest');
const sinon = require('sinon');
const app = require('../server');
const pool = require('../config/db');

describe('API Swap Orders (/api/swaps)', () => {

  afterEach(() => {
    sinon.restore();
  });

  afterAll(async () => {
    try {
      if (pool && typeof pool.end === 'function') {
        await pool.end();
      }
    } catch (err) {
      console.warn('Avviso chiusura pool DB:', err.message);
    }
  });

  // 1. Test GET /api/swaps
  test('GET /api/swaps - Recupera l\'elenco degli ordini swap', async () => {
    const mockSwaps = [{ id: 1, created_at: '2026-10-30T10:00:00.000Z' }];
    const mockUsers = [{ id: 1, name: 'Mario', email: 'mario@test.com' }];
    const mockProducts = [{ id: 10, name: 'Giacca', price: '50.00', status: 'swapped' }];

    // Stub per le sub-query sequenziali della GET
    const executeStub = sinon.stub(pool, 'execute');
    executeStub.onFirstCall().resolves([mockSwaps, []]);    // Query principale swap_orders
    executeStub.onSecondCall().resolves([mockUsers, []]);   // Query swap_order_users
    executeStub.onThirdCall().resolves([mockProducts, []]); // Query swap_order_products

    const res = await request(app).get('/api/swaps');

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].id).toBe(1);
    expect(res.body[0].total_gross_value).toBe('50.00');
  });

  // 2. Test DELETE /api/swaps/:id
  test('DELETE /api/swaps/:id - Elimina un ordine swap non esistente', async () => {
    const mockConnection = {
      beginTransaction: sinon.stub().resolves(),
      execute: sinon.stub(),
      rollback: sinon.stub().resolves(),
      release: sinon.stub().resolves()
    };

    // Simula che l'ordine non esista (array vuoto)
    mockConnection.execute.onFirstCall().resolves([[], []]);

    sinon.stub(pool, 'getConnection').resolves(mockConnection);

    const res = await request(app).delete('/api/swaps/999999');

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('error', 'Ordine swap non trovato');
    expect(mockConnection.rollback.calledOnce).toBe(true);
    expect(mockConnection.release.calledOnce).toBe(true);
  });

  // 3. Test POST /api/swaps (Blocco se un prodotto è 'swapped')
  test('POST /api/swaps - Rifiuta lo swap se un prodotto è già swapped', async () => {
    const mockConnection = {
      beginTransaction: sinon.stub().resolves(),
      execute: sinon.stub(),
      rollback: sinon.stub().resolves(),
      release: sinon.stub().resolves()
    };

    // Simula la SELECT di validateSwapData() dove il prodotto 10 ha status = 'swapped'
    mockConnection.execute.onFirstCall().resolves([
      [
        { id: 10, user_id: 1, status: 'swapped', name: 'Giacca Vintage' },
        { id: 12, user_id: 2, status: 'available', name: 'T-Shirt Silk' }
      ],
      []
    ]);

    sinon.stub(pool, 'getConnection').resolves(mockConnection);

    const res = await request(app)
      .post('/api/swaps')
      .send({ user_ids: [1, 2], product_ids: [10, 12] });

    // Verifichiamo che la validazione blocchi lo swap con stato 400 e il messaggio relativo allo status
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toContain('non è più disponibile');
  });

});

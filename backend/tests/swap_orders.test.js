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
    const mockSwaps = [
      { id: 1, created_at: '2026-10-30T10:00:00.000Z' }
    ];

    // Intercetta sia query che execute
    sinon.stub(pool, 'query').callsFake(async () => [mockSwaps, []]);
    if (pool.execute) {
      sinon.stub(pool, 'execute').callsFake(async () => [mockSwaps, []]);
    }

    const res = await request(app).get('/api/swaps');

    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].id).toBe(1);
  });

  // 2. Test DELETE /api/swaps/:id
  test('DELETE /api/swaps/:id - Elimina un ordine swap non esistente', async () => {
    sinon.stub(pool, 'query').callsFake(async () => [{ affectedRows: 0 }, []]);
    if (pool.execute) {
      sinon.stub(pool, 'execute').callsFake(async () => [{ affectedRows: 0 }, []]);
    }

    const res = await request(app).delete('/api/swaps/999999');

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('error', 'Ordine swap non trovato');
  });

  // 3. Test POST /api/swaps
  test('POST /api/swaps - Rifiuta lo swap se un prodotto è già swapped', async () => {
    const mockConnection = {
      beginTransaction: sinon.stub().resolves(),
      query: sinon.stub(),
      execute: sinon.stub(),
      rollback: sinon.stub().resolves(),
      release: sinon.stub().resolves()
    };

    // Simula la SELECT iniziale sulla connessione
    const mockProductSelect = [
      [
        { id: 10, name: 'Giacca Vintage', status: 'swapped' },
        { id: 12, name: 'T-Shirt Silk', status: 'available' }
      ],
      []
    ];

    mockConnection.query.resolves(mockProductSelect);
    mockConnection.execute.resolves(mockProductSelect);

    sinon.stub(pool, 'getConnection').resolves(mockConnection);

    const res = await request(app)
      .post('/api/swaps')
      .send({ user_ids: [1, 2], product_ids: [10, 12] });

    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    expect(mockConnection.rollback.calledOnce).toBe(true);
    expect(mockConnection.release.calledOnce).toBe(true);
  });

});

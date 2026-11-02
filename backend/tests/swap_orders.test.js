const request = require('supertest');
const sinon = require('sinon');
const { expect } = require('chai');
const app = require('../server');
const pool = require('../config/db');

describe('API Swap Orders (/api/swaps)', () => {

  afterEach(() => {
    sinon.restore();
  });

  after(async () => {
    try {
      if (pool && typeof pool.end === 'function') {
        await pool.end();
      }
    } catch (err) {
      console.warn('Avviso chiusura pool DB:', err.message);
    }
  });

  // 1. Test GET /api/swaps
  it('GET /api/swaps - Recupera l\'elenco degli ordini swap', async () => {
    const mockSwaps = [{ id: 1, created_at: '2026-10-30T10:00:00.000Z' }];
    const mockUsers = [{ id: 1, name: 'Mario', email: 'mario@test.com' }];
    const mockProducts = [{ id: 10, name: 'Giacca', price: '50.00', status: 'swapped' }];

    const executeStub = sinon.stub(pool, 'execute');
    executeStub.onFirstCall().resolves([mockSwaps, []]);
    executeStub.onSecondCall().resolves([mockUsers, []]);
    executeStub.onThirdCall().resolves([mockProducts, []]);

    const res = await request(app).get('/api/swaps');

    expect(res.statusCode).to.equal(200);
    expect(Array.isArray(res.body)).to.be.true;
    expect(res.body.length).to.equal(1);
    expect(res.body[0].id).to.equal(1);
    expect(res.body[0].total_gross_value).to.equal('50.00');
  });

  // 2. Test DELETE /api/swaps/:id
  it('DELETE /api/swaps/:id - Elimina un ordine swap non esistente', async () => {
    const mockConnection = {
      beginTransaction: sinon.stub().resolves(),
      execute: sinon.stub(),
      rollback: sinon.stub().resolves(),
      release: sinon.stub().resolves()
    };

    mockConnection.execute.onFirstCall().resolves([[], []]);
    sinon.stub(pool, 'getConnection').resolves(mockConnection);

    const res = await request(app).delete('/api/swaps/999999');

    expect(res.statusCode).to.equal(404);
    expect(res.body).to.have.property('error', 'Ordine swap non trovato');
    expect(mockConnection.rollback.calledOnce).to.be.true;
    expect(mockConnection.release.calledOnce).to.be.true;
  });

  // 3. Test POST /api/swaps (Blocco se un prodotto è 'swapped')
  it('POST /api/swaps - Rifiuta lo swap se un prodotto è già swapped', async () => {
    const mockConnection = {
      beginTransaction: sinon.stub().resolves(),
      execute: sinon.stub(),
      rollback: sinon.stub().resolves(),
      release: sinon.stub().resolves()
    };

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

    expect(res.statusCode).to.equal(400);
    expect(res.body).to.have.property('error');
    expect(res.body.error).to.include('non è più disponibile');
  });

});
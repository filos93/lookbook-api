// backend/tests/swap_orders.test.js
const request = require('supertest');
const app = require('../server'); // Importa l'app Express
const pool = require('../config/db');

describe('API Swap Orders (/api/swaps)', () => {

  // Pulizia o setup DB se necessario
  afterAll(async () => {
    await pool.end(); // Chiude la connessione MySQL alla fine dei test
  });

  test('GET /api/swaps - Recupera l\'elenco degli ordini swap', async () => {
    const res = await request(app).get('/api/swaps');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('DELETE /api/swaps/:id - Elimina un ordine swap non esistente', async () => {
    const res = await request(app).delete('/api/swaps/999999');
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('error', 'Ordine swap non trovato');
  });

});
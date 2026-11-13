// Impostazione dell'ambiente di test prima di caricare le variabili d'ambiente
process.env.NODE_ENV = 'test';

const request = require('supertest');
const { expect } = require('chai');
const app = require('../server');
const pool = require('../config/db');

describe('Integration Tests - Swap Orders & Products (Live MySQL)', function () {
  // Timeout esteso per latenza di rete SSL verso Aiven
  this.timeout(15000);

  let user1Id, user2Id, user3Id;
  let product1Id, product2Id, product3Id;

  // Pulizia completa delle tabelle rispettando le Foreign Keys
  async function resetDatabase() {
    await pool.execute('DELETE FROM swap_order_users');
    await pool.execute('DELETE FROM swap_order_products');
    await pool.execute('DELETE FROM swap_orders');
    await pool.execute('DELETE FROM product_photos');
    await pool.execute('DELETE FROM products');
    await pool.execute('DELETE FROM users');
  }

  beforeEach(async () => {
    await resetDatabase();

    // 1. Inserimento 3 utenti reali
    const [u1] = await pool.execute(
      'INSERT INTO users (name, surname, email) VALUES (?, ?, ?)',
      ['Mario', 'Rossi', 'mario.test@lookbook.it']
    );
    const [u2] = await pool.execute(
      'INSERT INTO users (name, surname, email) VALUES (?, ?, ?)',
      ['Laura', 'Bianchi', 'laura.test@lookbook.it']
    );
    const [u3] = await pool.execute(
      'INSERT INTO users (name, surname, email) VALUES (?, ?, ?)',
      ['Giulia', 'Verdi', 'giulia.test@lookbook.it']
    );

    user1Id = u1.insertId;
    user2Id = u2.insertId;
    user3Id = u3.insertId;

    // 2. Inserimento 3 prodotti reali (1 per utente, tutti 'available')
    const [p1] = await pool.execute(
      'INSERT INTO products (user_id, name, price, status) VALUES (?, ?, ?, ?)',
      [user1Id, 'Giacca Vintage Pelle', 80.00, 'available']
    );
    const [p2] = await pool.execute(
      'INSERT INTO products (user_id, name, price, status) VALUES (?, ?, ?, ?)',
      [user2Id, 'Stivali Chelsea', 75.00, 'available']
    );
    const [p3] = await pool.execute(
      'INSERT INTO products (user_id, name, price, status) VALUES (?, ?, ?, ?)',
      [user3Id, 'Borsa Tracolla', 90.00, 'available']
    );

    product1Id = p1.insertId;
    product2Id = p2.insertId;
    product3Id = p3.insertId;
  });

  after(async () => {
    try {
      await resetDatabase();
      if (pool && typeof pool.end === 'function') {
        await pool.end();
      }
    } catch (err) {
      console.warn('Avviso chiusura pool DB:', err.message);
    }
  });

  // =========================================================================
  // 1. CONCORRENZA (Race Condition & Lock Pessimistico FOR UPDATE)
  // =========================================================================
  it('POST /api/swaps - Gestisce la concorrenza: due richieste simultanee sullo stesso capo creano UN solo swap', async () => {
    // Laura (user2) e Giulia (user3) provano nello stesso istante a scambiare con il capo di Mario (product1)
    const reqLaura = request(app)
      .post('/api/swaps')
      .send({
        user_ids: [user1Id, user2Id],
        product_ids: [product1Id, product2Id]
      });

    const reqGiulia = request(app)
      .post('/api/swaps')
      .send({
        user_ids: [user1Id, user3Id],
        product_ids: [product1Id, product3Id]
      });

    const [res1, res2] = await Promise.all([reqLaura, reqGiulia]);
    const statusCodes = [res1.statusCode, res2.statusCode].sort((a, b) => a - b);

    // Una richiesta vince (201), l'altra viene serializzata dal lock FOR UPDATE e rifiutata (400)
    expect(statusCodes).to.deep.equal([201, 400]);

    const rejectedRes = res1.statusCode === 400 ? res1 : res2;
    expect(rejectedRes.body.error).to.include('non è più disponibile');

    // Verifica reale su MySQL: esiste 1 solo ordine in swap_orders
    const [orders] = await pool.execute('SELECT id FROM swap_orders');
    expect(orders).to.have.lengthOf(1);

    // Il capo conteso risulta 'swapped'
    const [prod1Rows] = await pool.execute('SELECT status FROM products WHERE id = ?', [product1Id]);
    expect(prod1Rows[0].status).to.equal('swapped');
  });

  // =========================================================================
  // 2. CAPO BLOCCATO (Protezione modifica/eliminazione dopo lo swap e ripristino)
  // =========================================================================
  it('PUT & DELETE /api/products/:id - Blocca modifiche ed eliminazione su un capo già swapped e lo sblocca alla cancellazione dello swap', async () => {
    // Crea lo swap tra Mario e Laura
    const createSwap = await request(app)
      .post('/api/swaps')
      .send({
        user_ids: [user1Id, user2Id],
        product_ids: [product1Id, product2Id]
      });
    expect(createSwap.statusCode).to.equal(201);
    const swapId = createSwap.body.id;

    // Tentativo di modifica del capo scambiato -> 400
    const putBlocked = await request(app)
      .put(`/api/products/${product1Id}`)
      .send({ name: 'Nome Modificato Illegale', price: 10.00 });
    expect(putBlocked.statusCode).to.equal(400);
    expect(putBlocked.body.error).to.include('già scambiato');

    // Tentativo di eliminazione del capo scambiato -> 400
    const delBlocked = await request(app)
      .delete(`/api/products/${product1Id}`);
    expect(delBlocked.statusCode).to.equal(400);
    expect(delBlocked.body.error).to.include('attualmente scambiato');

    // Elimina l'ordine di swap -> i capi tornano 'available'
    const delSwap = await request(app).delete(`/api/swaps/${swapId}`);
    expect(delSwap.statusCode).to.equal(200);

    const [productsAfter] = await pool.execute(
      'SELECT id, status FROM products WHERE id IN (?, ?)',
      [product1Id, product2Id]
    );
    expect(productsAfter.every(p => p.status === 'available')).to.be.true;
  });

  // =========================================================================
  // 3. LA MODIFICA CHE NON MODIFICA (Protezione status su PUT product & payload incompleto su PUT swap)
  // =========================================================================
  it('PUT /api/products/:id - Ignora la forzatura manuale dello status nel payload', async () => {
    const res = await request(app)
      .put(`/api/products/${product1Id}`)
      .send({
        name: 'Giacca Vintage Restauro',
        price: 95.00,
        status: 'swapped' // Deve essere ignorato
      });

    expect(res.statusCode).to.equal(200);
    expect(res.body.name).to.equal('Giacca Vintage Restauro');
    expect(res.body.status).to.equal('available');

    // Verifica sul DB reale che lo status non sia stato alterato
    const [rows] = await pool.execute('SELECT name, status FROM products WHERE id = ?', [product1Id]);
    expect(rows[0].name).to.equal('Giacca Vintage Restauro');
    expect(rows[0].status).to.equal('available');
  });

  it('PUT /api/swaps/:id - Rifiuta payload incompleti senza alterare lo swap esistente sul DB', async () => {
    // Crea uno swap valido
    const createRes = await request(app)
      .post('/api/swaps')
      .send({
        user_ids: [user1Id, user2Id],
        product_ids: [product1Id, product2Id]
      });
    expect(createRes.statusCode).to.equal(201);
    const swapId = createRes.body.id;

    // Invio payload incompleto (manca product_ids)
    const incompleteRes = await request(app)
      .put(`/api/swaps/${swapId}`)
      .send({
        user_ids: [user1Id, user3Id]
      });

    expect(incompleteRes.statusCode).to.equal(400);
    expect(incompleteRes.body).to.have.property('error');

    // Verifica su GET /api/swaps che lo swap originale sia rimasto intatto (ancora user1 e user2)
    const getRes = await request(app).get('/api/swaps');
    expect(getRes.statusCode).to.equal(200);
    const savedSwap = getRes.body.find(s => s.id === swapId);
    const savedUserIds = savedSwap.users.map(u => u.id).sort((a, b) => a - b);
    expect(savedUserIds).to.deep.equal([user1Id, user2Id].sort((a, b) => a - b));
  });
});

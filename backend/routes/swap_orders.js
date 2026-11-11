const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// --- HELPER DI VALIDAZIONE SWAP ---
async function validateSwapData(connection, userIds, productIds) {
    const errors = [];

    // 1. Controllo presenza e formato array
    if (!Array.isArray(userIds) || userIds.length !== 2) {
        return { isValid: false, errors: ['Devi selezionare esattamente 2 utenti distinti per lo swap.'] };
    }
    if (!Array.isArray(productIds) || productIds.length !== 2) {
        return { isValid: false, errors: ['Devi selezionare esattamente 2 prodotti distinti per lo swap.'] };
    }

    const u1 = parseInt(userIds[0], 10);
    const u2 = parseInt(userIds[1], 10);
    const p1 = parseInt(productIds[0], 10);
    const p2 = parseInt(productIds[1], 10);

    // 2. Prevenzione Swap sullo stesso utente
    if (u1 === u2) {
        errors.push('Lo swap deve avvenire tra due utenti differenti.');
    }

    // 3. Prevenzione Swap sullo stesso prodotto
    if (p1 === p2) {
        errors.push('Lo swap deve coinvolgere due articoli differenti.');
    }

    if (errors.length > 0) {
        return { isValid: false, errors };
    }

    // 4. Verifica esistenza, proprietà e STATO dei prodotti sul DB con blocco di riga pessimistico (FOR UPDATE)
    const [products] = await connection.execute(
        'SELECT id, user_id, status, name FROM products WHERE id IN (?, ?) FOR UPDATE',
        [p1, p2]
    );

    if (products.length !== 2) {
        errors.push('Uno o entrambi i prodotti selezionati non esistono.');
        return { isValid: false, errors };
    }

    // 5. Controllo se uno dei prodotti è già stato scambiato ('swapped')
    const swappedProduct = products.find(p => p.status === 'swapped');
    if (swappedProduct) {
        errors.push(`Il prodotto "${swappedProduct.name || swappedProduct.id}" non è più disponibile per lo swap.`);
        return { isValid: false, errors };
    }

    const prod1 = products.find(p => p.id === p1);
    const prod2 = products.find(p => p.id === p2);

    // 6. Verifica la coerenza proprietario-prodotto (1 capo per utente)
    const validOwnership = 
        (prod1.user_id === u1 && prod2.user_id === u2) ||
        (prod1.user_id === u2 && prod2.user_id === u1);

    if (!validOwnership) {
        errors.push('Ciascun capo selezionato deve appartenere al rispettivo utente partecipante allo swap.');
    }

    return { isValid: errors.length === 0, errors, cleanUserIds: [u1, u2], cleanProductIds: [p1, p2] };
}


// GET /api/swaps - Elenco ordini swap (ottimizzato: risolto problema N+1 queries)
router.get('/', async (req, res, next) => {
    try {
        const { date, startDate, endDate, productId } = req.query;
        let query = 'SELECT DISTINCT s.id, s.created_at FROM swap_orders s';
        const params = [];
        const whereClauses = [];

        // Filtro per data singola
        if (date) {
            whereClauses.push('DATE(s.created_at) = ?');
            params.push(date);
        }

        // Filtro per range di date (Inizio e Fine)
        if (startDate) {
            whereClauses.push('DATE(s.created_at) >= ?');
            params.push(startDate);
        }

        if (endDate) {
            whereClauses.push('DATE(s.created_at) <= ?');
            params.push(endDate);
        }

        // Filtro per Prodotto specifico contenuto nello swap
        if (productId) {
            whereClauses.push('s.id IN (SELECT order_id FROM swap_order_products WHERE product_id = ?)');
            params.push(productId);
        }

        if (whereClauses.length > 0) {
            query += ' WHERE ' + whereClauses.join(' AND ');
        }

        query += ' ORDER BY s.id DESC';

        const [swaps] = await pool.execute(query, params);

        if (swaps.length === 0) {
            return res.json([]);
        }

        // Estrazione degli ID di tutti gli ordini per la query in batch
        const orderIds = swaps.map(s => s.id);
        const placeholders = orderIds.map(() => '?').join(',');

        // Query in batch 1: Recupera gli utenti di tutti gli ordini in un'unica chiamata
        const [allUsers] = await pool.execute(`
            SELECT sou.order_id, u.id, u.name, u.surname, u.email 
            FROM users u
            JOIN swap_order_users sou ON u.id = sou.user_id
            WHERE sou.order_id IN (${placeholders})
        `, orderIds);

        // Query in batch 2: Recupera i prodotti di tutti gli ordini in un'unica chiamata
        const [allProducts] = await pool.execute(`
            SELECT sop.order_id, p.id, p.name, p.price, p.status, p.user_id AS owner_id 
            FROM products p
            JOIN swap_order_products sop ON p.id = sop.product_id
            WHERE sop.order_id IN (${placeholders})
        `, orderIds);

        // Raggruppamento in memoria dei dati correlati per ciascun ordine
        const usersByOrder = {};
        const productsByOrder = {};

        for (const user of allUsers) {
            if (!usersByOrder[user.order_id]) usersByOrder[user.order_id] = [];
            const { order_id, ...userData } = user;
            usersByOrder[order_id].push(userData);
        }

        for (const product of allProducts) {
            if (!productsByOrder[product.order_id]) productsByOrder[product.order_id] = [];
            const { order_id, ...productData } = product;
            productsByOrder[order_id].push(productData);
        }

        // Ricomposizione della risposta finale
        const result = swaps.map(swap => {
            const users = usersByOrder[swap.id] || [];
            const products = productsByOrder[swap.id] || [];
            const totalGrossValue = products.reduce((acc, curr) => acc + Number(curr.price || 0), 0);

            return {
                id: swap.id,
                created_at: swap.created_at,
                users,
                products,
                total_gross_value: totalGrossValue.toFixed(2)
            };
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
});


// POST /api/swaps - Creazione ordine swap
router.post('/', async (req, res, next) => {
    let connection;
    try {
        connection = await pool.getConnection();

        // Supporta sia user_ids / product_ids che userIds / productIds
        const userIds = req.body.user_ids || req.body.userIds;
        const productIds = req.body.product_ids || req.body.productIds;

        // 1. Apri la transazione PRIMA della validazione per consentire il lock pessimistico (FOR UPDATE)
        await connection.beginTransaction();

        // 2. Validazione all'interno della transazione con row locking
        const { isValid, errors, cleanUserIds, cleanProductIds } = await validateSwapData(connection, userIds, productIds);
        if (!isValid) {
            await connection.rollback();
            return res.status(400).json({ error: errors.join(' ') });
        }

        const [orderResult] = await connection.execute('INSERT INTO swap_orders () VALUES ()');
        const orderId = orderResult.insertId;

        for (const userId of cleanUserIds) {
            await connection.execute('INSERT INTO swap_order_users (order_id, user_id) VALUES (?, ?)', [orderId, userId]);
        }

        for (const productId of cleanProductIds) {
            await connection.execute('INSERT INTO swap_order_products (order_id, product_id) VALUES (?, ?)', [orderId, productId]);
        }

        await connection.execute(
            'UPDATE products SET status = ? WHERE id IN (?, ?)', 
            ['swapped', cleanProductIds[0], cleanProductIds[1]]
        );

        await connection.commit();
        res.status(201).json({ id: orderId, user_ids: cleanUserIds, product_ids: cleanProductIds });
    } catch (error) {
        if (connection) await connection.rollback();
        next(error);
    } finally {
        if (connection) connection.release();
    }
});


// PUT /api/swaps/:id - Modifica utenti o prodotti partecipanti allo swap (Validazione stringente e risposta reale da DB)
router.put('/:id', async (req, res, next) => {
    const { id } = req.params;
    const userIds = req.body.user_ids || req.body.userIds;
    const productIds = req.body.product_ids || req.body.productIds;

    // Validazione stringente: entrambi gli array devono essere forniti
    if (!userIds || !productIds) {
        return res.status(400).json({ 
            error: 'Richiesta non valida. Devi fornire sia gli utenti (user_ids) sia i prodotti (product_ids) per aggiornare lo swap.' 
        });
    }

    let connection;

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 1. Verifica esistenza ordine swap (con lock della riga dell'ordine)
        const [orders] = await connection.execute('SELECT id FROM swap_orders WHERE id = ? FOR UPDATE', [id]);
        if (orders.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Ordine swap non trovato' });
        }

        // Ripristina temporaneamente i vecchi capi dell'ordine a 'available' per consentire la re-validazione
        const [oldProducts] = await connection.execute('SELECT product_id FROM swap_order_products WHERE order_id = ?', [id]);
        const oldProductIds = oldProducts.map(p => p.product_id);

        if (oldProductIds.length > 0) {
            const placeholders = oldProductIds.map(() => '?').join(',');
            await connection.execute(
                `UPDATE products SET status = 'available' WHERE id IN (${placeholders})`,
                oldProductIds
            );
        }

        // Validazione dei nuovi dati con blocco pessimistico (FOR UPDATE)
        const { isValid, errors, cleanUserIds, cleanProductIds } = await validateSwapData(connection, userIds, productIds);
        if (!isValid) {
            await connection.rollback();
            return res.status(400).json({ error: errors.join(' ') });
        }

        // Elimina vecchie associazioni pivot
        await connection.execute('DELETE FROM swap_order_users WHERE order_id = ?', [id]);
        await connection.execute('DELETE FROM swap_order_products WHERE order_id = ?', [id]);

        // Inserisci nuove associazioni pivot
        for (const userId of cleanUserIds) {
            await connection.execute('INSERT INTO swap_order_users (order_id, user_id) VALUES (?, ?)', [id, userId]);
        }

        for (const productId of cleanProductIds) {
            await connection.execute('INSERT INTO swap_order_products (order_id, product_id) VALUES (?, ?)', [id, productId]);
        }

        // Aggiorna lo stato dei nuovi capi a 'swapped'
        await connection.execute(
            'UPDATE products SET status = ? WHERE id IN (?, ?)',
            ['swapped', cleanProductIds[0], cleanProductIds[1]]
        );

        await connection.commit();

        // Recupera i dati reali salvati nel DB per la risposta
        const [savedUsers] = await pool.execute(
            'SELECT user_id FROM swap_order_users WHERE order_id = ? ORDER BY user_id ASC', 
            [id]
        );
        const [savedProducts] = await pool.execute(
            'SELECT product_id FROM swap_order_products WHERE order_id = ? ORDER BY product_id ASC', 
            [id]
        );

        res.json({ 
            message: `Ordine swap #${id} aggiornato con successo`, 
            id: Number(id), 
            user_ids: savedUsers.map(u => u.user_id), 
            product_ids: savedProducts.map(p => p.product_id) 
        });
    } catch (error) {
        if (connection) await connection.rollback();
        next(error);
    } finally {
        if (connection) connection.release();
    }
});


// DELETE /api/swaps/:id - Eliminazione ordine swap e ripristino stato prodotti a 'available'
router.delete('/:id', async (req, res, next) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const { id } = req.params;
        await connection.beginTransaction();

        const [orders] = await connection.execute('SELECT id FROM swap_orders WHERE id = ? FOR UPDATE', [id]);
        if (orders.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Ordine swap non trovato' });
        }

        // 1. Recupera i prodotti legati all'ordine per ripristinarne lo stato
        const [products] = await connection.execute('SELECT product_id FROM swap_order_products WHERE order_id = ?', [id]);
        const productIds = products.map(p => p.product_id);

        // 2. Elimina le relazioni e l'ordine
        await connection.execute('DELETE FROM swap_order_users WHERE order_id = ?', [id]);
        await connection.execute('DELETE FROM swap_order_products WHERE order_id = ?', [id]);
        await connection.execute('DELETE FROM swap_orders WHERE id = ?', [id]);

        // 3. Ripristino stato prodotti a 'available'
        if (productIds.length > 0) {
            const placeholders = productIds.map(() => '?').join(',');
            await connection.execute(
                `UPDATE products SET status = ? WHERE id IN (${placeholders})`,
                ['available', ...productIds]
            );
        }

        await connection.commit();
        res.json({ message: `Ordine swap #${id} eliminato con successo`, id: Number(id) });
    } catch (error) {
        if (connection) await connection.rollback();
        next(error);
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;

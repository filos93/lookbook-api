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

    // 4. Verifica esistenza, proprietà e STATO dei prodotti sul DB
    const [products] = await connection.execute(
        'SELECT id, user_id, status, name FROM products WHERE id IN (?, ?)',
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


// GET /api/swaps - Elenco ordini swap con filtri per Data (singola o range) e Prodotto
router.get('/', async (req, res) => {
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

        for (let swap of swaps) {
            const [users] = await pool.execute(`
                SELECT u.id, u.name, u.surname, u.email 
                FROM users u
                JOIN swap_order_users sou ON u.id = sou.user_id
                WHERE sou.order_id = ?
            `, [swap.id]);

            const [products] = await pool.execute(`
                SELECT p.id, p.name, p.price, p.status, p.user_id AS owner_id 
                FROM products p
                JOIN swap_order_products sop ON p.id = sop.product_id
                WHERE sop.order_id = ?
            `, [swap.id]);

            const totalGrossValue = products.reduce((acc, curr) => acc + Number(curr.price || 0), 0);

            swap.users = users;
            swap.products = products;
            swap.total_gross_value = totalGrossValue.toFixed(2);
        }

        res.json(swaps);
    } catch (error) {
        res.status(500).json({ error: 'Errore recupero ordini swap', details: error.message });
    }
});


// POST /api/swaps - Creazione ordine swap
router.post('/', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        // Supporta sia user_ids / product_ids che userIds / productIds
        const userIds = req.body.user_ids || req.body.userIds;
        const productIds = req.body.product_ids || req.body.productIds;

        // Validazione stringente
        const { isValid, errors, cleanUserIds, cleanProductIds } = await validateSwapData(connection, userIds, productIds);
        if (!isValid) {
            return res.status(400).json({ error: errors.join(' ') });
        }

        await connection.beginTransaction();

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
        await connection.rollback();
        console.error('Errore durante la creazione dello swap:', error);
        res.status(500).json({ error: 'Errore creazione ordine swap', details: error.message });
    } finally {
        connection.release();
    }
});


// PUT /api/swaps/:id - Modifica utenti o prodotti partecipanti allo swap
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    // Supporta sia user_ids / product_ids che userIds / productIds
    const userIds = req.body.user_ids || req.body.userIds;
    const productIds = req.body.product_ids || req.body.productIds;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Verifica esistenza ordine swap
        const [orders] = await connection.execute('SELECT id FROM swap_orders WHERE id = ?', [id]);
        if (orders.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Ordine swap non trovato' });
        }

        if (userIds && productIds) {
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

            // Validazione dei nuovi dati
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
        }

        await connection.commit();
        res.json({ message: `Ordine swap #${id} aggiornato con successo`, id: Number(id), user_ids: userIds, product_ids: productIds });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Errore aggiornamento ordine swap', details: error.message });
    } finally {
        connection.release();
    }
});


// DELETE /api/swaps/:id - Eliminazione ordine swap e ripristino stato prodotti a 'available'
router.delete('/:id', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        await connection.beginTransaction();

        const [orders] = await connection.execute('SELECT id FROM swap_orders WHERE id = ?', [id]);
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
        await connection.rollback();
        console.error('Errore durante eliminazione swap:', error);
        res.status(500).json({ error: 'Errore durante l\'eliminazione dello swap', details: error.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/swaps - Elenco degli ordini swap (con filtro opzionale per data)
router.get('/', async (req, res) => {
    try {
        const { date } = req.query;
        let query = 'SELECT id, created_at FROM swap_orders';
        const params = [];

        if (date) {
            query += ' WHERE DATE(created_at) = ?';
            params.push(date);
        }
        query += ' ORDER BY id DESC';

        const [swaps] = await pool.execute(query, params);

        // Arricchimento ordini con utenti e prodotti associati
        for (let swap of swaps) {
            const [users] = await pool.execute(`
                SELECT u.id, u.name, u.surname, u.email 
                FROM users u
                JOIN swap_order_users sou ON u.id = sou.user_id
                WHERE sou.order_id = ?
            `, [swap.id]);

            const [products] = await pool.execute(`
                SELECT p.id, p.name, p.price 
                FROM products p
                JOIN swap_order_products sop ON p.id = sop.product_id
                WHERE sop.order_id = ?
            `, [swap.id]);

            swap.users = users;
            swap.products = products;
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
        const { user_ids, product_ids } = req.body;

        if (!user_ids || user_ids.length !== 2 || !product_ids || product_ids.length !== 2) {
            return res.status(400).json({ error: 'Devi selezionare esattamente 2 utenti e 2 prodotti' });
        }

        await connection.beginTransaction();

        const [orderResult] = await connection.execute('INSERT INTO swap_orders () VALUES ()');
        const orderId = orderResult.insertId;

        for (const userId of user_ids) {
            await connection.execute('INSERT INTO swap_order_users (order_id, user_id) VALUES (?, ?)', [orderId, userId]);
        }

        for (const productId of product_ids) {
            await connection.execute('INSERT INTO swap_order_products (order_id, product_id) VALUES (?, ?)', [orderId, productId]);
        }

        await connection.commit();
        res.status(201).json({ id: orderId, user_ids, product_ids });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Errore creazione ordine swap', details: error.message });
    } finally {
        connection.release();
    }
});

// DELETE /api/swaps/:id - Eliminazione ordine swap
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.execute('DELETE FROM swap_orders WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Ordine swap non trovato' });
        }

        res.json({ message: `Ordine swap #${id} eliminato con successo` });
    } catch (error) {
        res.status(500).json({ error: 'Errore durante l\'eliminazione dello swap', details: error.message });
    }
});

module.exports = router;
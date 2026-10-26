const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/products - Elenco prodotti con proprietario e foto
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT p.id, p.name, p.price, p.user_id, u.name AS owner_name, u.email AS owner_email,
                   GROUP_CONCAT(pp.photo_url) AS photos
            FROM products p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN product_photos pp ON p.id = pp.product_id
            GROUP BY p.id
            ORDER BY p.id ASC
        `);

        const products = rows.map(p => ({
            ...p,
            photos: p.photos ? p.photos.split(',') : []
        }));

        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Errore recupero prodotti', details: error.message });
    }
});

// POST /api/products - Creazione prodotto
router.post('/', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { user_id, name, price, photos } = req.body;
        if (!user_id || !name) {
            return res.status(400).json({ error: 'user_id e name sono obbligatori' });
        }

        const numericPrice = parseFloat(price) || 0.00;

        await connection.beginTransaction();

        const [productResult] = await connection.execute(
            'INSERT INTO products (user_id, name, price) VALUES (?, ?, ?)',
            [user_id, name, numericPrice]
        );
        const productId = productResult.insertId;

        if (photos && Array.isArray(photos)) {
            for (const photoUrl of photos) {
                await connection.execute(
                    'INSERT INTO product_photos (product_id, photo_url) VALUES (?, ?)',
                    [productId, photoUrl]
                );
            }
        }

        await connection.commit();
        res.status(201).json({ id: productId, user_id, name, price: numericPrice, photos: photos || [] });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Errore inserimento prodotto', details: error.message });
    } finally {
        connection.release();
    }
});

// PUT /api/products/:id - Modifica prodotto (inclusa la riassegnazione di user_id)
router.put('/:id', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const { user_id, name, price, photos } = req.body;

        await connection.beginTransaction();

        // 1. Verifica che il prodotto esista
        const [products] = await connection.execute('SELECT * FROM products WHERE id = ?', [id]);
        if (products.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Prodotto non trovato' });
        }

        const currentProduct = products[0];

        // 2. Prepara i nuovi valori (mantiene i precedenti se omessi)
        const updatedUserId = user_id !== undefined ? user_id : currentProduct.user_id;
        const updatedName = name !== undefined ? name : currentProduct.name;
        const updatedPrice = price !== undefined ? parseFloat(price) : currentProduct.price;

        // 3. Aggiorna la tabella principale
        await connection.execute(
            'UPDATE products SET user_id = ?, name = ?, price = ? WHERE id = ?',
            [updatedUserId, updatedName, updatedPrice, id]
        );

        // 4. Aggiorna le foto se passate nel body
        if (photos && Array.isArray(photos)) {
            await connection.execute('DELETE FROM product_photos WHERE product_id = ?', [id]);
            for (const photoUrl of photos) {
                await connection.execute(
                    'INSERT INTO product_photos (product_id, photo_url) VALUES (?, ?)',
                    [id, photoUrl]
                );
            }
        }

        await connection.commit();

        res.json({
            message: 'Prodotto aggiornato con successo',
            id: Number(id),
            user_id: updatedUserId,
            name: updatedName,
            price: updatedPrice,
            photos: photos || []
        });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Errore modifica prodotto', details: error.message });
    } finally {
        connection.release();
    }
});

// DELETE /api/products/:id - Eliminazione singolo prodotto
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [products] = await connection.execute('SELECT id FROM products WHERE id = ?', [id]);
        if (products.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Prodotto non trovato' });
        }

        await connection.execute('DELETE FROM product_photos WHERE product_id = ?', [id]);
        await connection.execute('DELETE FROM products WHERE id = ?', [id]);

        await connection.commit();
        res.json({ message: 'Prodotto eliminato con successo', id: parseInt(id, 10) });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Errore durante l\'eliminazione del prodotto', details: error.message });
    } finally {
        connection.release();
    }
});

module.exports = router;
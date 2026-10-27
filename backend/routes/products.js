const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// --- HELPER DI VALIDAZIONE PER PRODOTTI ---
function validateAndSanitizeProduct(data, isUpdate = false) {
    const errors = [];
    const cleanData = {};

    // 1. Gestione NOME PRODOTTO
    if (data.name !== undefined) {
        const trimmedName = data.name.trim();
        if (!trimmedName) {
            errors.push('Il nome del prodotto non può essere vuoto.');
        } else if (trimmedName.length < 2 || trimmedName.length > 100) {
            errors.push('Il nome del prodotto deve essere compreso tra 2 e 100 caratteri.');
        }
        cleanData.name = trimmedName;
    } else if (!isUpdate) {
        errors.push('Il campo name è obbligatorio.');
    }

    // 2. Gestione PREZZO
    if (data.price !== undefined) {
        const numericPrice = parseFloat(data.price);
        if (isNaN(numericPrice) || numericPrice < 0) {
            errors.push('Il prezzo deve essere un numero valido maggiore o uguale a 0.');
        } else {
            // Arrotonda a due cifre decimali
            cleanData.price = Math.round(numericPrice * 100) / 100;
        }
    } else if (!isUpdate) {
        cleanData.price = 0.00;
    }

    // 3. Gestione USER_ID
    if (data.user_id !== undefined) {
        const userId = parseInt(data.user_id, 10);
        if (isNaN(userId) || userId <= 0) {
            errors.push('user_id non valido.');
        } else {
            cleanData.user_id = userId;
        }
    } else if (!isUpdate) {
        errors.push('Il campo user_id è obbligatorio.');
    }

    // 4. Gestione ARRAY FOTO
    if (data.photos !== undefined) {
        if (Array.isArray(data.photos)) {
            // Pulisce gli URL ed elimina eventuali valori vuoti o non stringhe
            cleanData.photos = data.photos
                .filter(url => typeof url === 'string')
                .map(url => url.trim())
                .filter(url => url.length > 0);
        } else {
            errors.push('Il campo photos deve essere un array di URL.');
        }
    }

    return {
        isValid: errors.length === 0,
        errors,
        cleanData
    };
}

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
    // 1. Validazione input
    const { isValid, errors, cleanData } = validateAndSanitizeProduct(req.body, false);
    if (!isValid) {
        return res.status(400).json({ error: errors.join(' ') });
    }

    const connection = await pool.getConnection();
    try {
        const { user_id, name, price, photos = [] } = cleanData;

        // 2. Verifica che l'utente esista prima di collegare il prodotto
        const [users] = await connection.execute('SELECT id FROM users WHERE id = ?', [user_id]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'L\'utente specificato (user_id) non esiste.' });
        }

        await connection.beginTransaction();

        const [productResult] = await connection.execute(
            'INSERT INTO products (user_id, name, price) VALUES (?, ?, ?)',
            [user_id, name, price]
        );
        const productId = productResult.insertId;

        // Inserimento foto
        for (const photoUrl of photos) {
            await connection.execute(
                'INSERT INTO product_photos (product_id, photo_url) VALUES (?, ?)',
                [productId, photoUrl]
            );
        }

        await connection.commit();
        res.status(201).json({ id: productId, user_id, name, price, photos });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Errore inserimento prodotto', details: error.message });
    } finally {
        connection.release();
    }
});

// PUT /api/products/:id - Modifica prodotto (supporta aggiornamenti parziali)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    
    // 1. Validazione input
    const { isValid, errors, cleanData } = validateAndSanitizeProduct(req.body, true);
    if (!isValid) {
        return res.status(400).json({ error: errors.join(' ') });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // 2. Verifica che il prodotto esista
        const [products] = await connection.execute('SELECT * FROM products WHERE id = ?', [id]);
        if (products.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Prodotto non trovato' });
        }

        const currentProduct = products[0];

        // 3. Se user_id viene modificato, verifica che il nuovo utente esista
        if (cleanData.user_id !== undefined && cleanData.user_id !== currentProduct.user_id) {
            const [users] = await connection.execute('SELECT id FROM users WHERE id = ?', [cleanData.user_id]);
            if (users.length === 0) {
                await connection.rollback();
                return res.status(404).json({ error: 'Il nuovo utente specificato non esiste.' });
            }
        }

        // 4. Prepara i nuovi valori (mantiene i precedenti se omessi)
        const updatedUserId = cleanData.user_id !== undefined ? cleanData.user_id : currentProduct.user_id;
        const updatedName = cleanData.name !== undefined ? cleanData.name : currentProduct.name;
        const updatedPrice = cleanData.price !== undefined ? cleanData.price : currentProduct.price;

        // 5. Aggiorna la tabella principale
        await connection.execute(
            'UPDATE products SET user_id = ?, name = ?, price = ? WHERE id = ?',
            [updatedUserId, updatedName, updatedPrice, id]
        );

        // 6. Aggiorna le foto solo se passate esplicitamente nel body
        let finalPhotos = [];
        if (cleanData.photos !== undefined) {
            await connection.execute('DELETE FROM product_photos WHERE product_id = ?', [id]);
            for (const photoUrl of cleanData.photos) {
                await connection.execute(
                    'INSERT INTO product_photos (product_id, photo_url) VALUES (?, ?)',
                    [id, photoUrl]
                );
            }
            finalPhotos = cleanData.photos;
        } else {
            // Recupera le foto esistenti per la risposta JSON
            const [existingPhotos] = await connection.execute('SELECT photo_url FROM product_photos WHERE product_id = ?', [id]);
            finalPhotos = existingPhotos.map(row => row.photo_url);
        }

        await connection.commit();

        res.json({
            message: 'Prodotto aggiornato con successo',
            id: Number(id),
            user_id: updatedUserId,
            name: updatedName,
            price: updatedPrice,
            photos: finalPhotos
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
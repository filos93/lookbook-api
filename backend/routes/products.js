const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// --- HELPER DI VALIDAZIONE PER PRODOTTI ---
function validateAndSanitizeProduct(data, isUpdate = false) {
    const errors = [];
    const cleanData = {};

    // 1. NOME PRODOTTO
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

    // 2. PREZZO
    if (data.price !== undefined) {
        const numericPrice = parseFloat(data.price);
        if (isNaN(numericPrice) || numericPrice < 0) {
            errors.push('Il prezzo deve essere un numero valido maggiore o uguale a 0.');
        } else {
            cleanData.price = Math.round(numericPrice * 100) / 100;
        }
    } else if (!isUpdate) {
        cleanData.price = 0.00;
    }

    // 3. USER_ID
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

    // 4. STATUS ('available' o 'swapped')
    if (data.status !== undefined) {
        const validStatuses = ['available', 'swapped'];
        if (!validStatuses.includes(data.status)) {
            errors.push('Lo status deve essere "available" o "swapped".');
        } else {
            cleanData.status = data.status;
        }
    } else if (!isUpdate) {
        cleanData.status = 'available'; // Default per i nuovi prodotti
    }

    // 5. ARRAY FOTO
    if (data.photos !== undefined) {
        if (Array.isArray(data.photos)) {
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

// GET /api/products - Elenco prodotti con proprietario, foto e status
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT p.id, p.name, p.price, p.status, p.user_id, u.name AS owner_name, u.email AS owner_email,
                   GROUP_CONCAT(pp.photo_url) AS photos
            FROM products p
            LEFT JOIN users u ON p.user_id = u.id
            LEFT JOIN product_photos pp ON p.id = pp.product_id
            GROUP BY p.id
            ORDER BY p.id ASC
        `);

        const products = rows.map(p => ({
            ...p,
            status: p.status || 'available',
            photos: p.photos ? p.photos.split(',') : []
        }));

        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Errore recupero prodotti', details: error.message });
    }
});

// POST /api/products - Creazione prodotto
router.post('/', async (req, res) => {
    const { isValid, errors, cleanData } = validateAndSanitizeProduct(req.body, false);
    if (!isValid) {
        return res.status(400).json({ error: errors.join(' ') });
    }

    const connection = await pool.getConnection();
    try {
        const { user_id, name, price, status, photos = [] } = cleanData;

        const [users] = await connection.execute('SELECT id FROM users WHERE id = ?', [user_id]);
        if (users.length === 0) {
            connection.release();
            return res.status(404).json({ error: 'L\'utente specificato (user_id) non esiste.' });
        }

        await connection.beginTransaction();

        const [productResult] = await connection.execute(
            'INSERT INTO products (user_id, name, price, status) VALUES (?, ?, ?, ?)',
            [user_id, name, price, status]
        );
        const productId = productResult.insertId;

        for (const photoUrl of photos) {
            await connection.execute(
                'INSERT INTO product_photos (product_id, photo_url) VALUES (?, ?)',
                [productId, photoUrl]
            );
        }

        await connection.commit();
        res.status(201).json({ id: productId, user_id, name, price, status, photos });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Errore inserimento prodotto', details: error.message });
    } finally {
        connection.release();
    }
});

// PUT /api/products/:id - Modifica prodotto (incluso status)
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    
    const { isValid, errors, cleanData } = validateAndSanitizeProduct(req.body, true);
    if (!isValid) {
        return res.status(400).json({ error: errors.join(' ') });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [products] = await connection.execute('SELECT * FROM products WHERE id = ?', [id]);
        if (products.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Prodotto non trovato' });
        }

        const currentProduct = products[0];

        if (currentProduct.status === 'swapped') {
            await connection.rollback();
            return res.status(400).json({ 
                error: 'Non puoi modificare le informazioni di un capo che risulta già scambiato.' 
            });
        }

        if (cleanData.user_id !== undefined && cleanData.user_id !== currentProduct.user_id) {
            const [users] = await connection.execute('SELECT id FROM users WHERE id = ?', [cleanData.user_id]);
            if (users.length === 0) {
                await connection.rollback();
                return res.status(404).json({ error: 'Il nuovo utente specificato non esiste.' });
            }
        }

        const updatedUserId = cleanData.user_id !== undefined ? cleanData.user_id : currentProduct.user_id;
        const updatedName = cleanData.name !== undefined ? cleanData.name : currentProduct.name;
        const updatedPrice = cleanData.price !== undefined ? cleanData.price : currentProduct.price;
        const updatedStatus = cleanData.status !== undefined ? cleanData.status : currentProduct.status;

        await connection.execute(
            'UPDATE products SET user_id = ?, name = ?, price = ?, status = ? WHERE id = ?',
            [updatedUserId, updatedName, updatedPrice, updatedStatus, id]
        );

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
            status: updatedStatus,
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

        const [products] = await connection.execute('SELECT id, status FROM products WHERE id = ?', [id]);
        if (products.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Prodotto non trovato' });
        }

        // Blocco sicurezza: impedisce di eliminare un prodotto attualmente coinvolto in uno swap
        if (products[0].status === 'swapped') {
            await connection.rollback();
            return res.status(400).json({ 
                error: 'Non puoi eliminare un prodotto che risulta attualmente scambiato. Elimina prima l\'ordine di swap.' 
            });
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

const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// GET /api/users - Elenco utenti in ordine di ID crescente
router.get('/', async (req, res) => {
    try {
        const [rows] = await pool.execute('SELECT id, name, surname, email FROM users ORDER BY id ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Errore durante il recupero degli utenti', details: error.message });
    }
});

// GET /api/users/:id - Dettaglio utente e relativi prodotti
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [users] = await pool.execute('SELECT id, name, surname, email FROM users WHERE id = ?', [id]);
        
        if (users.length === 0) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }

        const [products] = await pool.execute(`
            SELECT p.id, p.name, p.price, GROUP_CONCAT(pp.photo_url) AS photos
            FROM products p
            LEFT JOIN product_photos pp ON p.id = pp.product_id
            WHERE p.user_id = ?
            GROUP BY p.id
            ORDER BY p.id ASC
        `, [id]);

        res.json({
            ...users[0],
            products: products.map(p => ({ ...p, photos: p.photos ? p.photos.split(',') : [] }))
        });
    } catch (error) {
        res.status(500).json({ error: 'Errore recupero dettagli utente', details: error.message });
    }
});

// POST /api/users - Nuovo utente
router.post('/', async (req, res) => {
    try {
        const { name, surname, email } = req.body;
        if (!name || !surname || !email) {
            return res.status(400).json({ error: 'I campi name, surname ed email sono obbligatori' });
        }

        const [result] = await pool.execute(
            'INSERT INTO users (name, surname, email) VALUES (?, ?, ?)',
            [name, surname, email]
        );

        res.status(201).json({ id: result.insertId, name, surname, email });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email già registrata' });
        }
        res.status(500).json({ error: 'Errore durante la creazione dell\'utente', details: error.message });
    }
});

// DELETE /api/users/:id - Eliminazione utente e prodotti/dipendenze
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Verifica esistenza utente
        const [users] = await connection.execute('SELECT id FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Utente non trovato' });
        }

        // 2. Elimina le foto dei prodotti appartenenti all'utente
        await connection.execute(`
            DELETE pp FROM product_photos pp
            INNER JOIN products p ON pp.product_id = p.id
            WHERE p.user_id = ?
        `, [id]);

        // 3. Elimina i prodotti dell'utente
        await connection.execute('DELETE FROM products WHERE user_id = ?', [id]);

        // 4. Elimina l'utente
        await connection.execute('DELETE FROM users WHERE id = ?', [id]);

        await connection.commit();
        res.json({ message: 'Utente ed eventuali prodotti correlati eliminati con successo', id: parseInt(id, 10) });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: 'Errore durante l\'eliminazione dell\'utente', details: error.message });
    } finally {
        connection.release();
    }
});

// PUT /api/users/:id - Modifica dati utente
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, surname, email } = req.body;

        // 1. Verifica che l'utente esista
        const [users] = await pool.execute('SELECT id, name, surname, email FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }

        // 2. Prepara i nuovi valori (se un campo non viene passato nel body, mantiene quello attuale)
        const updatedName = name !== undefined ? name : users[0].name;
        const updatedSurname = surname !== undefined ? surname : users[0].surname;
        const updatedEmail = email !== undefined ? email : users[0].email;

        // 3. Esegui l'UPDATE nel DB
        await pool.execute(
            'UPDATE users SET name = ?, surname = ?, email = ? WHERE id = ?',
            [updatedName, updatedSurname, updatedEmail, id]
        );

        res.json({
            id: parseInt(id, 10),
            name: updatedName,
            surname: updatedSurname,
            email: updatedEmail
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Email già registrata da un altro utente' });
        }
        res.status(500).json({ error: 'Errore durante l\'aggiornamento dell\'utente', details: error.message });
    }
});

module.exports = router;
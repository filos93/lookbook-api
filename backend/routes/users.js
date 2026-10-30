const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// --- HELPER DI VALIDAZIONE E SANITIZZAZIONE ---
// Regex per nome/cognome: ammette lettere (inclusi accenti), spazi, apostrofi e trattini. Nessun numero o carattere speciale.
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s'-]+$/;
// Regex standard per l'email: ammette cifre numeriche prima della @
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateAndSanitizeUser(data, isUpdate = false) {
    const errors = [];
    const cleanData = {};

    // Gestione NOME
    if (data.name !== undefined) {
        const trimmedName = data.name.trim();
        if (!trimmedName) {
            errors.push('Il nome non può essere vuoto.');
        } else if (trimmedName.length < 2 || trimmedName.length > 50) {
            errors.push('Il nome deve essere compreso tra 2 e 50 caratteri.');
        } else if (!NAME_REGEX.test(trimmedName)) {
            errors.push('Il nome non può contenere numeri o caratteri speciali.');
        }
        cleanData.name = trimmedName;
    } else if (!isUpdate) {
        errors.push('Il campo name è obbligatorio.');
    }

    // Gestione COGNOME
    if (data.surname !== undefined) {
        const trimmedSurname = data.surname.trim();
        if (!trimmedSurname) {
            errors.push('Il cognome non può essere vuoto.');
        } else if (trimmedSurname.length < 2 || trimmedSurname.length > 50) {
            errors.push('Il cognome deve essere compreso tra 2 e 50 caratteri.');
        } else if (!NAME_REGEX.test(trimmedSurname)) {
            errors.push('Il cognome non può contenere numeri o caratteri speciali.');
        }
        cleanData.surname = trimmedSurname;
    } else if (!isUpdate) {
        errors.push('Il campo surname è obbligatorio.');
    }

    // Gestione EMAIL
    if (data.email !== undefined) {
        const trimmedEmail = data.email.trim().toLowerCase();
        if (!trimmedEmail) {
            errors.push('L\'email non può essere vuota.');
        } else if (!EMAIL_REGEX.test(trimmedEmail)) {
            errors.push('Formato email non valido.');
        }
        cleanData.email = trimmedEmail;
    } else if (!isUpdate) {
        errors.push('Il campo email è obbligatorio.');
    }

    return {
        isValid: errors.length === 0,
        errors,
        cleanData
    };
}


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
    // 1. Validazione input
    const { isValid, errors, cleanData } = validateAndSanitizeUser(req.body, false);
    if (!isValid) {
        return res.status(400).json({ error: errors.join(' ') });
    }

    try {
        const { name, surname, email } = cleanData;

        const [result] = await pool.execute(
            'INSERT INTO users (name, surname, email) VALUES (?, ?, ?)',
            [name, surname, email]
        );

        res.status(201).json({ id: result.insertId, name, surname, email });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Email già registrata' });
        }
        res.status(500).json({ error: 'Errore durante la creazione dell\'utente', details: error.message });
    }
});

// DELETE /api/users/:id - Eliminazione utente in cascata con pulizia swap
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Verifica che l'utente esista
        const [users] = await connection.execute('SELECT id, name FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            await connection.rollback();
            return res.status(404).json({ error: 'Utente non trovato' });
        }

        // 2. Recupera tutti gli ordini swap a cui l'utente partecipa
        const [userSwaps] = await connection.execute(
            'SELECT order_id FROM swap_order_users WHERE user_id = ?',
            [id]
        );
        const swapIds = userSwaps.map(s => s.order_id);

        if (swapIds.length > 0) {
            const swapPlaceholders = swapIds.map(() => '?').join(',');

            // 2a. Trova tutti i prodotti legati a questi swap
            const [swapProducts] = await connection.execute(
                `SELECT product_id FROM swap_order_products WHERE order_id IN (${swapPlaceholders})`,
                swapIds
            );
            const productIds = swapProducts.map(p => p.product_id);

            // 2b. Ripristina lo stato a 'available' per i prodotti coinvolti
            if (productIds.length > 0) {
                const prodPlaceholders = productIds.map(() => '?').join(',');
                await connection.execute(
                    `UPDATE products SET status = 'available' WHERE id IN (${prodPlaceholders})`,
                    productIds
                );
            }

            // 2c. Rimuovi le relazioni e gli ordini swap correlati
            await connection.execute(`DELETE FROM swap_order_users WHERE order_id IN (${swapPlaceholders})`, swapIds);
            await connection.execute(`DELETE FROM swap_order_products WHERE order_id IN (${swapPlaceholders})`, swapIds);
            await connection.execute(`DELETE FROM swap_orders WHERE id IN (${swapPlaceholders})`, swapIds);
        }

        // 3. Elimina foto e prodotti appartenenti all'utente eliminato
        const [userProducts] = await connection.execute('SELECT id FROM products WHERE user_id = ?', [id]);
        if (userProducts.length > 0) {
            const userProdIds = userProducts.map(p => p.id);
            const userProdPlaceholders = userProdIds.map(() => '?').join(',');

            await connection.execute(`DELETE FROM product_photos WHERE product_id IN (${userProdPlaceholders})`, userProdIds);
            await connection.execute('DELETE FROM products WHERE user_id = ?', [id]);
        }

        // 4. Elimina l'utente
        await connection.execute('DELETE FROM users WHERE id = ?', [id]);

        await connection.commit();
        res.json({ 
            message: `Utente #${id} eliminato. Gli swap a cui partecipava sono stati annullati e il valore totale ricalcolato.` 
        });
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

        // 1. Verifica che l'utente esista
        const [users] = await pool.execute('SELECT id, name, surname, email FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Utente non trovato' });
        }

        // 2. Validazione e sanitizzazione dati in ingresso
        const { isValid, errors, cleanData } = validateAndSanitizeUser(req.body, true);
        if (!isValid) {
            return res.status(400).json({ error: errors.join(' ') });
        }

        // 3. Prepara i nuovi valori (se un campo non è presente nel body, mantiene quello attuale)
        const updatedName = cleanData.name !== undefined ? cleanData.name : users[0].name;
        const updatedSurname = cleanData.surname !== undefined ? cleanData.surname : users[0].surname;
        const updatedEmail = cleanData.email !== undefined ? cleanData.email : users[0].email;

        // 4. Esegui l'UPDATE nel DB
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
            return res.status(409).json({ error: 'Email già registrata da un altro utente' });
        }
        res.status(500).json({ error: 'Errore durante l\'aggiornamento dell\'utente', details: error.message });
    }
});

module.exports = router;
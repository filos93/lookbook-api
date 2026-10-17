const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Registrazione Rotte API
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/swaps', require('./routes/swap_orders'));

// Gestione risorse statiche e build React (Produzione)
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Fallback per SPA React (esclude le chiamate /api)
// SINTASSI EXPRESS 5
app.get('/{*splat}', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'), (err) => {
        if (err) {
            res.status(200).send('API Express attiva (Frontend dist non ancora compilato).');
        }
    });
});

// Esportazione dell'app Express per le suite di test (Mocha / Supertest)
module.exports = app;

// Avvio ascolto porta solo se eseguito direttamente (non da Mocha)
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server Express in ascolto su http://localhost:${PORT}`);
    });
}
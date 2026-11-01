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
const distPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(distPath));

// Fallback per SPA React (Express 5 wildcard / catch-all)
app.get('/{*splat}', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    
    res.sendFile(path.join(distPath, 'index.html'), (err) => {
        if (err && !res.headersSent) {
            res.status(200).send('API Express attiva (Frontend dist non ancora compilato).');
        }
    });
});

// Middleware Globale Gestione Errori (4 parametri)
app.use((err, req, res, next) => {
    console.error('❌ Errore Backend Uncaught:', err.stack || err.message);
    res.status(err.status || 500).json({
        error: err.message || 'Errore interno del server'
    });
});

// Esportazione dell'app Express per le suite di test (Mocha / Supertest)
module.exports = app;

// Avvio ascolto porta solo se eseguito direttamente
if (require.main === module) {
    const PORT = process.env.PORT ||process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server Express in ascolto su http://localhost:${PORT}`);
    });
}
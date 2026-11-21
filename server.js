const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());

// Health Check Endpoint
app.get('/', (req, res) => {
    res.json({
        status: 'ok',
        service: 'LookBook REST API'
    });
});

// Registrazione Rotte API
app.use('/api/users', require('./routes/users'));
app.use('/api/products', require('./routes/products'));
app.use('/api/swaps', require('./routes/swap_orders'));

// Gestione Rotte Non Trovate (404 JSON)
app.use((req, res) => {
    res.status(404).json({
        error: `Endpoint non trovato: ${req.method} ${req.originalUrl}`
    });
});

// Middleware Globale Gestione Errori (4 parametri)
app.use((err, req, res, next) => {
    // Log completo dell'errore lato server per il debugging
    console.error('❌ Errore API Uncaught:', err.stack || err);

    // Evita di esporre dettagli interni del database o query SQL al client
    const isProduction = process.env.NODE_ENV === 'production';
    const statusCode = err.status || err.statusCode || 500;
    
    const clientMessage = isProduction && statusCode === 500
        ? 'Errore interno del server'
        : (err.message || 'Errore interno del server');

    res.status(statusCode).json({
        error: clientMessage
    });
});

// Esportazione dell'app Express per le suite di test (Mocha / Supertest)
module.exports = app;

// Avvio ascolto porta solo se eseguito direttamente
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 Server Express API in ascolto su http://localhost:${PORT}`);
    });
}

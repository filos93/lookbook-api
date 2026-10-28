const mysql = require('mysql2/promise');
require('dotenv').config();

// Se usi un URI completo (es. mysql://user:pass@host:port/dbname) o variabili separate
const pool = mysql.createPool(
    process.env.MYSQL_URL || {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 11000, // Porta tipica Aiven
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        // Aiven richiede SSL. Se DB_SSL non è 'false', abilita SSL per default in produzione/Aiven
        ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    }
);

module.exports = pool;
const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const isLocal = !process.env.DB_HOST || process.env.DB_HOST === 'localhost' || process.env.DB_HOST === '127.0.0.1';
const isAiven = process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com');

// Determina se abilitare SSL (richiesto da Aiven, disabilitato in locale)
const useSSL = process.env.DB_SSL !== undefined 
  ? process.env.DB_SSL === 'true' 
  : isAiven;

const pool = mysql.createPool(
  process.env.MYSQL_URL || {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'defaultdb',
    ssl: useSSL ? { rejectUnauthorized: false } : false,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }
);

// Log sintetico per verificare la connessione all'avvio
console.log(`🔌 Database Pool creato su ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306} [DB: ${process.env.DB_NAME || 'defaultdb'}] [SSL: ${useSSL}]`);

module.exports = pool;
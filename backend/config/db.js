const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// 1. Fail-fast validation: Blocca l'avvio se manca la configurazione critica in .env
if (!process.env.MYSQL_URL && (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME)) {
  console.error('❌ FATAL: Configurazione Database mancante. Verifica che il file .env sia presente e configurato.');
  process.exit(1);
}

const isAiven = process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com');

// Determina se abilitare SSL (richiesto da Aiven, disabilitato in locale)
const useSSL = process.env.DB_SSL !== undefined 
  ? process.env.DB_SSL === 'true' 
  : isAiven;

// Configurazione opzioni SSL sicure per Aiven Cloud
let sslOption = false;

if (useSSL) {
  const caPath = path.resolve(__dirname, './ca.pem');
  if (process.env.DB_SSL_CA) {
    sslOption = { ca: process.env.DB_SSL_CA, rejectUnauthorized: true };
  } else if (fs.existsSync(caPath)) {
    sslOption = { ca: fs.readFileSync(caPath), rejectUnauthorized: true };
  } else {
    // Abilita la verifica standard del certificato se non viene fornito un CA custom
    sslOption = { rejectUnauthorized: true };
  }
}

const pool = mysql.createPool(
  process.env.MYSQL_URL || {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: sslOption,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  }
);

// Log sintetico per verificare la connessione all'avvio
console.log(`🔌 Database Pool creato su ${process.env.DB_HOST}:${process.env.DB_PORT || 3306} [DB: ${process.env.DB_NAME}] [SSL: ${useSSL}]`);

module.exports = pool;

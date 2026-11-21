const mysql = require('mysql2/promise');
const path = require('path');
const fs = require('fs');

const envFile = process.env.NODE_ENV === 'test' ? '../.env.test' : '../.env';
require('dotenv').config({
  path: path.resolve(__dirname, envFile),
  override: process.env.NODE_ENV === 'test'
});

// 1. Fail-fast validation: Blocca l'avvio se manca la configurazione critica in .env
if (!process.env.MYSQL_URL && (!process.env.DB_HOST || !process.env.DB_USER || !process.env.DB_NAME)) {
  console.error(`❌ FATAL: Configurazione Database mancante. Verifica che il file ${envFile} sia presente e configurato.`);
  process.exit(1);
}

const isAiven = process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com');

// Determina se abilitare SSL (supporta sia 'true' che 'REQUIRED')
const useSSL = process.env.DB_SSL !== undefined
  ? ['true', 'REQUIRED'].includes(process.env.DB_SSL)
  : isAiven;

// Configurazione opzioni SSL sicure per Aiven Cloud (supporta sia percorso file che stringa PEM inline)
let sslOption = false;

if (useSSL) {
  const defaultCaPath = path.resolve(__dirname, './ca.pem');
  const caInput = process.env.DB_SSL_CA;

  if (caInput) {
    const resolvedCaPath = path.resolve(__dirname, '..', caInput);
    const caContent = fs.existsSync(resolvedCaPath)
      ? fs.readFileSync(resolvedCaPath)
      : caInput.replace(/\\n/g, '\n');

    sslOption = { ca: caContent, rejectUnauthorized: true };
  } else if (fs.existsSync(defaultCaPath)) {
    sslOption = { ca: fs.readFileSync(defaultCaPath), rejectUnauthorized: true };
  } else {
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

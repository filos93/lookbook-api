const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const fs = require('fs');
const pool = require('./db');

async function runSqlFile(filePath) {
  const sqlContent = fs.readFileSync(filePath, 'utf8');
  // Rimuove i commenti SQL e separa le query tramite il punto e coma
  const queries = sqlContent
    .replace(/--.*$/gm, '')
    .split(';')
    .map(query => query.trim())
    .filter(query => query.length > 0);

  for (const query of queries) {
    await pool.query(query);
  }
}

async function initializeDatabase() {
  try {
    console.log(`Connessione a ${process.env.DB_HOST}:${process.env.DB_PORT}...`);

    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const seedsPath = path.join(__dirname, '..', 'db', 'seeds.sql');

    console.log('Esecuzione schema.sql...');
    await runSqlFile(schemaPath);

    console.log('Esecuzione seeds.sql...');
    await runSqlFile(seedsPath);

    console.log(' Database Aiven inizializzato con successo!');
    process.exit(0);
  } catch (error) {
    console.error(' Errore durante l\'inizializzazione:', error);
    process.exit(1);
  }
}

initializeDatabase();
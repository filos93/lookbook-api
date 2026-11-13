const path = require('path');
require('dotenv').config({
  path: process.env.NODE_ENV === 'test'
    ? path.resolve(__dirname, '../.env.test')
    : path.resolve(__dirname, '../.env')
});

const fs = require('fs');
const pool = require('./db');

async function runSqlFile(connection, filePath) {
  const sqlContent = fs.readFileSync(filePath, 'utf8');

  // Pulizia commenti SQL (singola riga -- e blocchi /* */)
  const cleanSql = sqlContent
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  // Separazione sicura delle query ignorando righe vuote
  const queries = cleanSql
    .split(';')
    .map((query) => query.trim())
    .filter((query) => query.length > 0);

  for (const query of queries) {
    await connection.query(query);
  }
}

async function initializeDatabase() {
  let connection;
  try {
    const host = process.env.DB_HOST;
    const port = process.env.DB_PORT || 3306;
    const dbName = process.env.DB_NAME;

    if (!host || !dbName) {
      console.error('❌ FATAL: DB_HOST o DB_NAME non definiti nel file .env.');
      process.exit(1);
    }

    console.log(`📡 Connessione al database su ${host}:${port} [DB: ${dbName}]...`);

    connection = await pool.getConnection();

    // Guardrail: controlla se la tabella 'users' esiste già in ambiente di produzione
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    `, [dbName]);

    if (tables.length > 0 && process.env.NODE_ENV === 'production') {
      console.warn('⚠️ Il database contiene già le tabelle. Inizializzazione saltata per proteggere i dati di produzione.');
      return;
    }

    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const seedsPath = path.join(__dirname, '..', 'db', 'seeds.sql');

    console.log('📄 Esecuzione schema.sql...');
    await runSqlFile(connection, schemaPath);

    console.log('🌱 Esecuzione seeds.sql...');
    await runSqlFile(connection, seedsPath);

    console.log('✅ Database inizializzato e popolato con successo!');
  } catch (error) {
    console.error('❌ Errore durante l\'inizializzazione del database:', error.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      connection.release();
    }
    await pool.end();
  }
}

// Avvia l'inizializzazione solo se il file è eseguito direttamente da terminale
if (require.main === module) {
  initializeDatabase().then(() => {
    if (process.exitCode === 1) {
      process.exit(1);
    }
  });
}

module.exports = initializeDatabase;

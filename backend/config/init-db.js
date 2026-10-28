const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const fs = require('fs');
const pool = require('./db');

async function runSqlFile(filePath) {
  const sqlContent = fs.readFileSync(filePath, 'utf8');

  // Pulizia commenti SQL (singola riga e blocchi)
  const cleanSql = sqlContent
    .replace(/--.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  // Separazione sicura delle query ignorando righe vuote
  const queries = cleanSql
    .split(';')
    .map((query) => query.trim())
    .filter((query) => query.length > 0);

  for (const query of queries) {
    await pool.query(query);
  }
}

async function initializeDatabase() {
  const connection = await pool.getConnection();
  try {
    console.log(`📡 Connessione al database Aiven su ${process.env.DB_HOST}:${process.env.DB_PORT}...`);

    // Guardrail facoltativo: controlla se la tabella 'users' esiste già prima di sovrascrivere
    const [tables] = await connection.query(`
      SELECT TABLE_NAME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'users'
    `, [process.env.DB_NAME]);

    if (tables.length > 0 && process.env.NODE_ENV === 'production') {
      console.warn('⚠️ Il database contiene già le tabelle. Inizializzazione saltata per proteggere i dati di produzione.');
      process.exit(0);
    }

    const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
    const seedsPath = path.join(__dirname, '..', 'db', 'seeds.sql');

    console.log('📄 Esecuzione schema.sql...');
    await runSqlFile(schemaPath);

    console.log('🌱 Esecuzione seeds.sql...');
    await runSqlFile(seedsPath);

    console.log('✅ Database Aiven inizializzato e popolato con successo!');
  } catch (error) {
    console.error('❌ Errore durante l\'inizializzazione del database Aiven:', error.message);
    process.exit(1);
  } finally {
    connection.release();
    process.exit(0);
  }
}

initializeDatabase();
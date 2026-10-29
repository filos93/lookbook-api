const fs = require('fs');
const path = require('path');
const pool = require('./db');

const MIGRATIONS_DIR = path.join(__dirname, '../db/migrations');

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

async function getExecutedMigrations() {
  const [rows] = await pool.query(`
    SELECT filename
    FROM migrations
  `);

  return new Set(rows.map(row => row.filename));
}

async function executeMigration(filename) {
  const filePath = path.join(MIGRATIONS_DIR, filename);
  const sql = fs.readFileSync(filePath, 'utf8');

  console.log(`🚀 Eseguo migration: ${filename}`);

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query(sql);

    await connection.query(
      `
      INSERT INTO migrations (filename)
      VALUES (?)
      `,
      [filename]
    );

    await connection.commit();

    console.log(`✅ Completata: ${filename}`);
  } catch (error) {
    await connection.rollback();

    console.error(`❌ Errore nella migration ${filename}`);
    console.error(error.message);

    throw error;
  } finally {
    connection.release();
  }
}

async function runMigrations() {
  try {
    console.log('📡 Connessione al database...');

    await ensureMigrationsTable();

    const executed = await getExecutedMigrations();

    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort();

    const pending = files.filter(
      file => !executed.has(file)
    );

    if (pending.length === 0) {
      console.log('✅ Nessuna migration da eseguire');
      process.exit(0);
    }

    console.log(
      `📦 Migration da eseguire: ${pending.length}`
    );

    for (const file of pending) {
      await executeMigration(file);
    }

    console.log('🎉 Tutte le migration completate');
    process.exit(0);

  } catch (error) {
    console.error('❌ Errore generale migration');
    console.error(error);
    process.exit(1);
  }
}

runMigrations();

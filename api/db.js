
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const { JWT_SECRET, ADMIN_EMAIL, DEFAULT_BALANCE } = require('../server/src/config/constants');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function initDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        balance NUMERIC NOT NULL DEFAULT 50
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS history (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        question TEXT NOT NULL,
        response TEXT NOT NULL,
        persona TEXT NOT NULL DEFAULT 'lawyer',
        role TEXT NOT NULL,
        file_name TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS requests (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount NUMERIC NOT NULL,
        screenshot TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Sovereign Admin king2026 Initialization Protocol
    const hashedAdmin = await bcrypt.hash('king2026', 10);
    await pool.query(
      `INSERT INTO users (email, username, password, role, balance)
       VALUES ($1, $2, $3, 'admin', 999999)
       ON CONFLICT (email) DO UPDATE SET 
       password = EXCLUDED.password, 
       username = 'king2026', 
       role = 'admin', 
       balance = 999999;`,
      ['bishoysamy390@gmail.com', 'king2026', hashedAdmin]
    );

    console.log('Sovereign Hub Active: king2026 Authority Recognized');
  } catch (err) {
    console.error('Sovereign DB Failure:', err.message);
  }
}

initDb();

module.exports = { pool };

const pool = require('./database');
const bcrypt = require('bcrypt');
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require('./constants');

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      balance NUMERIC NOT NULL DEFAULT 10
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

  const hashedAdmin = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await pool.query(
    `INSERT INTO users (email, username, password, role, balance)
      VALUES ($1, $2, $3, 'admin', 999999)
      ON CONFLICT (email) DO UPDATE SET username = EXCLUDED.username, role = 'admin', balance = 999999;`,
    [ADMIN_EMAIL, 'king2026', hashedAdmin]
  );
}

module.exports = initDb;

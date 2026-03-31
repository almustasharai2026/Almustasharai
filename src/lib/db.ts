import { Pool } from 'pg';

/**
 * محرك الربط السحابي السيادي (PostgreSQL Node).
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const initSovereignDatabase = async () => {
  try {
    // إنشاء جدول المواطنين
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        full_name TEXT NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        balance NUMERIC DEFAULT 50,
        is_banned BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // إنشاء جدول الكلمات المحظورة
    await query(`
      CREATE TABLE IF NOT EXISTS forbidden_words (
        id SERIAL PRIMARY KEY,
        word TEXT UNIQUE NOT NULL,
        severity TEXT DEFAULT 'critical'
      );
    `);

    // إنشاء جدول سجلات الأحداث
    await query(`
      CREATE TABLE IF NOT EXISTS logs (
        id SERIAL PRIMARY KEY,
        event_type TEXT,
        detail TEXT,
        admin_id TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("Sovereign Database: Online and Shielded.");
  } catch (e) {
    console.error("DB Protocol Failure:", e);
  }
};

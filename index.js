import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import fetch from 'node-fetch';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const db = new Database('data.db');

app.use(cors());
app.use(express.json());

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    name TEXT,
    phone TEXT,
    balance INTEGER DEFAULT 100,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    persona TEXT,
    messages TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    amount INTEGER,
    type TEXT,
    status TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

const adminEmail = process.env.ADMIN_EMAIL || 'bishoysamy390@gmail.com';
const adminPass = 'King@2026';
const adminHash = bcrypt.hashSync(adminPass, 10);
const stmt = db.prepare('INSERT OR IGNORE INTO users (email, password, name, role, balance) VALUES (?, ?, ?, ?, ?)');
stmt.run(adminEmail, adminHash, 'king2026', 'admin', 999999);

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) return res.status(401).json({ error: 'بيانات غير صحيحة' });
  const valid = bcrypt.compareSync(password, user.password);
  if (!valid) return res.status(401).json({ error: 'بيانات غير صحيحة' });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  res.json({ success: true, token, user: { email: user.email, name: user.name, role: user.role, balance: user.balance } });
});

app.post('/api/register', (req, res) => {
  const { email, password, name, phone } = req.body;
  const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (existing) return res.status(400).json({ error: 'البريد موجود' });
  const hash = bcrypt.hashSync(password, 10);
  const stmt = db.prepare('INSERT INTO users (email, password, name, phone, balance) VALUES (?, ?, ?, ?, ?)');
  const info = stmt.run(email, hash, name || email.split('@')[0], phone, 100);
  const token = jwt.sign({ id: info.lastInsertRowid, email, role: 'user' }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
  res.json({ success: true, token, user: { email, name: name || email.split('@')[0], role: 'user', balance: 100 } });
});

app.post('/api/chat', async (req, res) => {
  const { persona, message } = req.body;
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'غير مصرح' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);
    if (!user) return res.status(401).json({ error: 'مستخدم غير موجود' });
    if (user.balance < 1) return res.status(402).json({ error: 'رصيد غير كافٍ، يرجى الشحن' });

    db.prepare('UPDATE users SET balance = balance - 1 WHERE id = ?').run(user.id);
    const newBalance = user.balance - 1;

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const prompt = `أنت ${persona}، خبير قانوني محترف. أجب على السؤال التالي باللغة العربية: ${message}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    const data = await response.json();
    const reply = data.candidates[0].content.parts[0].text;

    db.prepare('INSERT INTO conversations (user_id, persona, messages) VALUES (?, ?, ?)')
      .run(user.id, persona, JSON.stringify([{ role: 'user', content: message }, { role: 'assistant', content: reply }]));

    res.json({ reply, newBalance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'خطأ في الخادم' });
  }
});

app.post('/api/upload', (req, res) => {
  res.json({ summary: 'تم استلام الملف بنجاح' });
});

app.post('/api/generate-document', (req, res) => {
  const { type, data } = req.body;
  res.json({ preview: `نموذج ${type} تم إنشاؤه بنجاح`, downloadUrl: '#' });
});

app.get('/api/admin/users', (req, res) => {
  const users = db.prepare('SELECT id, email, name, phone, balance, role, created_at FROM users').all();
  res.json(users);
});
app.get('/api/admin/stats', (req, res) => {
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const totalBalance = db.prepare('SELECT SUM(balance) as sum FROM users').get().sum;
  const totalConversations = db.prepare('SELECT COUNT(*) as count FROM conversations').get().count;
  const totalTransactions = db.prepare('SELECT COUNT(*) as count FROM transactions').get().count;
  res.json({ totalUsers, totalBalance, totalConversations, totalTransactions });
});
app.post('/api/admin/charge', (req, res) => {
  const { email, amount } = req.body;
  const user = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (!user) return res.status(404).json({ error: 'مستخدم غير موجود' });
  db.prepare('UPDATE users SET balance = balance + ? WHERE id = ?').run(amount, user.id);
  db.prepare('INSERT INTO transactions (user_id, amount, type, status) VALUES (?, ?, ?, ?)').run(user.id, amount, 'charge', 'completed');
  res.json({ success: true });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});


/**
 * ميثاق الثوابت السيادية - إصدار king2026.
 * يتم جلب هذه القيم من بيئة الإنتاج لضمان أمان الكوكب.
 */
const JWT_SECRET = process.env.JWT_SECRET || 'my_super_secret';
const ADMIN_EMAIL = 'bishoysamy390@gmail.com';
const ADMIN_PASSWORD = 'king@2020';
const DEFAULT_BALANCE = Number(process.env.DEFAULT_BALANCE || 50);
const PORT = process.env.PORT || 3000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_HOST = process.env.EMAIL_HOST || 'smtp.gmail.com';
const EMAIL_PORT = Number(process.env.EMAIL_PORT || 587);

module.exports = {
  JWT_SECRET,
  ADMIN_EMAIL,
  ADMIN_PASSWORD,
  DEFAULT_BALANCE,
  PORT,
  GEMINI_API_KEY,
  DATABASE_URL,
  OPENAI_API_KEY,
  EMAIL_USER,
  EMAIL_PASS,
  EMAIL_HOST,
  EMAIL_PORT
};

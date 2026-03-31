
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { pool } = require("./db");
const jwt = require('jsonwebtoken');
const { JWT_SECRET, ADMIN_EMAIL } = require('../server/src/config/constants');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * محرك الاستشارة السيادي (The Sovereign AI Counselor).
 * يتعرف على المالك ملكياً ويطبق قوانين المالية على الرعايا.
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  
  // 1. التحقق من التوكن والهوية السيادية
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'مطلوب توكن سيادي' });
  }

  const token = authHeader.split(' ')[1];
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return res.status(401).json({ error: 'التوكن غير صالح' });
  }

  const userId = decoded.id;
  const userEmail = decoded.email;
  const isOwner = userEmail === ADMIN_EMAIL;

  try {
    // 2. التحقق من الرصيد في قاعدة بيانات Neon (للأمان السيادي)
    const { rows: userRows } = await pool.query('SELECT balance FROM users WHERE id = $1', [userId]);
    if (userRows.length === 0) {
      return res.status(404).json({ error: 'المواطن غير مسجل' });
    }

    const currentBalance = Number(userRows[0].balance);
    const cost = 5; // تكلفة الاستشارة الذكية

    if (!isOwner && currentBalance < cost) {
      return res.status(402).json({ 
        error: "رصيدك غير كافٍ، اشحن لتستمر في استشارة المستشار AI",
        currentBalance 
      });
    }

    // 3. استدعاء المحرك الذكي Gemini Pro
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const systemInstruction = `أنت "المستشار AI" السيادي، العقل المفكر لمنصة بيشوي سامي القانونية. 
    يجب أن تكون إجاباتك رصينة، دقيقة، وقانونية باللغة العربية الفصحى. 
    تذكر أنك تقدم استشارات استرشادية لخدمة كوكب العدالة الرقمية.`;

    const result = await model.generateContent([systemInstruction, prompt]);
    const response = await result.response;
    const text = response.text();

    // 4. تنفيذ الخصم المالي السيادي وتوثيق العملية
    let finalBalance = currentBalance;
    if (!isOwner) {
      const { rows: updatedUser } = await pool.query(
        'UPDATE users SET balance = balance - $1 WHERE id = $2 RETURNING balance',
        [cost, userId]
      );
      finalBalance = Number(updatedUser[0].balance);

      // توثيق المعاملة في التاريخ
      await pool.query(
        'INSERT INTO history (user_id, question, response, persona, role) VALUES ($1, $2, $3, $4, $5)',
        [userId, prompt, text, 'المستشار AI', decoded.role]
      );
    }

    // 5. الاستجابة الملكية
    res.status(200).json({ 
      success: true,
      answer: text,
      newBalance: isOwner ? "∞ (سيادي)" : finalBalance,
      cost: isOwner ? 0 : cost
    });

  } catch (error) {
    console.error("[Sovereign AI Error]:", error);
    res.status(500).json({ error: "خطأ في معالجة الاستشارة الذكية" });
  }
};

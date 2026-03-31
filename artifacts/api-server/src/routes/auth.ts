import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { LoginBody, RegisterBody } from "@workspace/api-zod";

const router: IRouter = Router();

const JWT_SECRET = process.env["JWT_SECRET"] ?? "fallback_secret";
const ADMIN_EMAIL = process.env["ADMIN_EMAIL"] ?? "bishoysamy390@gmail.com";
const ADMIN_PASSWORD = process.env["ADMIN_PASSWORD"] ?? "admin1234";

async function ensureAdminExists() {
  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, ADMIN_EMAIL)).limit(1);
    if (existing.length === 0) {
      const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await db.insert(usersTable).values({
        email: ADMIN_EMAIL,
        password: hashed,
        name: "king2026",
        phone: "01000000000",
        balance: 999999,
        role: "admin",
      });
    } else {
      // Update existing admin password to simple one if requested
      const hashed = await bcrypt.hash(ADMIN_PASSWORD, 10);
      await db.update(usersTable).set({ 
        password: hashed, 
        name: "king2026",
        role: "admin",
        balance: 999999 
      }).where(eq(usersTable.email, ADMIN_EMAIL));
    }
  } catch {
  }
}

ensureAdminExists();

router.post("/login", async (req, res) => {
  try {
    const parsed = LoginBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "بيانات غير صحيحة" });
      return;
    }
    const { email, password } = parsed.data;
    const users = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (users.length === 0) {
      res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      return;
    }
    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
      return;
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        balance: user.balance,
        role: user.role,
        created_at: user.created_at.toISOString(),
      },
    });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const parsed = RegisterBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "بيانات غير صحيحة" });
      return;
    }
    const { email, password, name, phone } = parsed.data;
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "البريد الإلكتروني مستخدم بالفعل" });
      return;
    }
    const hashed = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({
      email,
      password: hashed,
      name,
      phone,
      balance: 10,
      role: "user",
    }).returning();
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        balance: user.balance,
        role: user.role,
        created_at: user.created_at.toISOString(),
      },
    });
  } catch (err) {
    req.log.error({ err }, "Register error");
    res.status(500).json({ error: "خطأ في الخادم" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "غير مصرح" });
      return;
    }
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    const users = await db.select().from(usersTable).where(eq(usersTable.id, decoded.id)).limit(1);
    if (users.length === 0) {
      res.status(401).json({ error: "المستخدم غير موجود" });
      return;
    }
    const user = users[0];
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      balance: user.balance,
      role: user.role,
      created_at: user.created_at.toISOString(),
    });
  } catch {
    res.status(401).json({ error: "رمز غير صالح" });
  }
});

export default router;
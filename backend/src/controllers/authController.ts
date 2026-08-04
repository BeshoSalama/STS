import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import { db } from "../config/db";
import { registerSchema, loginSchema } from "../../../frontend/src/lib/validations/auth";

export async function registerHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) return res.status(409).json({ error: "Email is already registered" });

    const passwordHash = await bcrypt.hash(parsed.data.password, 12);
    const user = await db.user.create({
      data: { name: parsed.data.name, email: parsed.data.email, passwordHash, role: "CLIENT" },
      select: { id: true, name: true, email: true, role: true },
    });

    return res.status(201).json({ user });
  } catch (error) {
    return next(error);
  }
}

export async function loginHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });

    const user = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (!user?.passwordHash) return res.status(401).json({ error: "Invalid email or password" });

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid email or password" });

    return res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    return next(error);
  }
}

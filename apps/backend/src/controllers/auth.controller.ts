import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword, generateTokenPair, validate } from '@exam-portal/utils/security';
import { loginSchema, registerSchema } from '@exam-portal/utils/security';

const prisma = new PrismaClient();

export async function register(req: Request, res: Response) {
  try {
    const validation = validate(registerSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const { name, email, password } = validation.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { email, name, passwordHash },
    });

    const tokens = generateTokenPair({ userId: user.id, email: user.email, role: user.role });
    res.status(201).json({ success: true, data: tokens });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const validation = validate(loginSchema, req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const tokens = generateTokenPair({ userId: user.id, email: user.email, role: user.role });
    res.json({ success: true, data: tokens });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Login failed' });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true },
    });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch user' });
  }
}

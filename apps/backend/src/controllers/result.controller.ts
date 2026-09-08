import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function listResults(req: Request, res: Response) {
  try {
    const results = await prisma.examResult.findMany({
      where: { userId: req.user!.userId },
      include: { exam: true },
      orderBy: { completedAt: 'desc' },
    });
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch results' });
  }
}

export async function getResult(req: Request, res: Response) {
  try {
    const result = await prisma.examResult.findFirst({
      where: { id: req.params.id, userId: req.user!.userId },
      include: { exam: true },
    });
    if (!result) return res.status(404).json({ success: false, error: 'Result not found' });
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch result' });
  }
}

export async function adminListAllResults(_req: Request, res: Response) {
  try {
    const results = await prisma.examResult.findMany({
      include: { user: { select: { id: true, name: true, email: true } }, exam: true },
      orderBy: { completedAt: 'desc' },
    });
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch results' });
  }
}

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function listSubjects(_req: Request, res: Response) {
  try {
    const subjects = await prisma.subject.findMany({
      include: { _count: { select: { questions: true } } },
    });
    res.json({ success: true, data: subjects });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch subjects' });
  }
}

export async function getSubject(req: Request, res: Response) {
  try {
    const subject = await prisma.subject.findUnique({
      where: { id: req.params.id },
      include: { _count: { select: { questions: true } } },
    });
    if (!subject) return res.status(404).json({ success: false, error: 'Subject not found' });
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch subject' });
  }
}

export async function createSubject(req: Request, res: Response) {
  try {
    const subject = await prisma.subject.create({ data: req.body });
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create subject' });
  }
}

export async function updateSubject(req: Request, res: Response) {
  try {
    const subject = await prisma.subject.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: subject });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update subject' });
  }
}

export async function deleteSubject(req: Request, res: Response) {
  try {
    await prisma.subject.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Subject deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete subject' });
  }
}

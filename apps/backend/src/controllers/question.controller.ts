import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function listQuestions(req: Request, res: Response) {
  try {
    const { subjectId, page = '1', limit = '20' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = subjectId ? { subjectId: subjectId as string } : {};
    const [questions, total] = await Promise.all([
      prisma.question.findMany({
        where,
        skip,
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.question.count({ where }),
    ]);

    res.json({
      success: true,
      data: questions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch questions' });
  }
}

export async function getQuestion(req: Request, res: Response) {
  try {
    const question = await prisma.question.findUnique({ where: { id: req.params.id } });
    if (!question) return res.status(404).json({ success: false, error: 'Question not found' });
    res.json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch question' });
  }
}

export async function createQuestion(req: Request, res: Response) {
  try {
    const question = await prisma.question.create({ data: req.body });
    res.status(201).json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create question' });
  }
}

export async function updateQuestion(req: Request, res: Response) {
  try {
    const question = await prisma.question.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update question' });
  }
}

export async function deleteQuestion(req: Request, res: Response) {
  try {
    await prisma.question.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete question' });
  }
}

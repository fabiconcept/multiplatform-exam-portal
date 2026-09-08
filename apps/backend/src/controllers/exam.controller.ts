import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { shuffleArray, calculateScore } from '@exam-portal/utils/scoring';

const prisma = new PrismaClient();

export async function listExams(_req: Request, res: Response) {
  try {
    const exams = await prisma.exam.findMany({
      where: { isActive: true },
      include: { subject: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: exams });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch exams' });
  }
}

export async function getExam(req: Request, res: Response) {
  try {
    const exam = await prisma.exam.findUnique({
      where: { id: req.params.id },
      include: {
        subject: true,
        questions: {
          include: { question: true },
          orderBy: { order: 'asc' },
        },
      },
    });
    if (!exam) return res.status(404).json({ success: false, error: 'Exam not found' });

    const shuffledQuestions = shuffleArray(exam.questions).map((eq, idx) => ({
      id: eq.question.id,
      order: idx + 1,
      text: eq.question.text,
      options: shuffleArray(eq.question.options as any[]),
      difficulty: eq.question.difficulty,
    }));

    res.json({ success: true, data: { ...exam, questions: shuffledQuestions } });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch exam' });
  }
}

export async function createExam(req: Request, res: Response) {
  try {
    const { questionIds, ...examData } = req.body;
    const exam = await prisma.exam.create({
      data: {
        ...examData,
        questions: {
          create: questionIds.map((questionId: string, index: number) => ({
            questionId,
            order: index + 1,
          })),
        },
      },
      include: { subject: true },
    });
    res.status(201).json({ success: true, data: exam });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to create exam' });
  }
}

export async function submitExam(req: Request, res: Response) {
  try {
    const { examId, answers, timeTakenMins } = req.body;
    const userId = req.user!.userId;

    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: { questions: { include: { question: true } } },
    });
    if (!exam) return res.status(404).json({ success: false, error: 'Exam not found' });

    const existing = await prisma.examResult.findFirst({
      where: { userId, examId },
    });
    if (existing) {
      return res.status(409).json({ success: false, error: 'Exam already submitted' });
    }

    const correctAnswers = new Map(
      exam.questions.map(eq => [eq.questionId, eq.question.correctAnswer])
    );

    const scoredAnswers = answers.map((a: any) => ({
      questionId: a.questionId,
      selectedAnswer: a.selectedAnswer,
      isCorrect: a.selectedAnswer === correctAnswers.get(a.questionId),
    }));

    const { score, total, percentage } = calculateScore(scoredAnswers);

    const result = await prisma.examResult.create({
      data: {
        userId,
        examId,
        score,
        totalQuestions: total,
        percentage,
        timeTakenMins,
        answers: scoredAnswers,
      },
    });

    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to submit exam' });
  }
}

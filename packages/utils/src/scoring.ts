export function calculateScore(answers: { selectedAnswer: string; correctAnswer: string }[]): {
  score: number;
  total: number;
  percentage: number;
} {
  const total = answers.length;
  const score = answers.filter(a => a.selectedAnswer === a.correctAnswer).length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  return { score, total, percentage };
}

export function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A+';
  if (percentage >= 80) return 'A';
  if (percentage >= 70) return 'B';
  if (percentage >= 60) return 'C';
  if (percentage >= 50) return 'D';
  if (percentage >= 40) return 'E';
  return 'F';
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

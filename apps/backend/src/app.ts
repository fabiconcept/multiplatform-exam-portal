import express from 'express';
import {
  applySecurityMiddleware,
  rateLimitMiddleware,
  throttleMiddleware,
  securityHeadersMiddleware,
} from './middleware/security';
import authRoutes from './routes/auth.routes';
import subjectRoutes from './routes/subject.routes';
import questionRoutes from './routes/question.routes';
import examRoutes from './routes/exam.routes';
import resultRoutes from './routes/result.routes';

const app = express();

applySecurityMiddleware(app);
app.use(securityHeadersMiddleware);
app.use(rateLimitMiddleware);
app.use(throttleMiddleware);

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/auth', authRoutes);
app.use('/subjects', subjectRoutes);
app.use('/questions', questionRoutes);
app.use('/exams', examRoutes);
app.use('/results', resultRoutes);

app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Not found' });
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

export default app;

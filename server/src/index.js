import express from 'express';
import cors from 'cors';
import { users, exams, studentScores, ROLES } from './db.js';
import userRoutes from './routes/userRoutes.js';
import examRoutes from './routes/examRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Log middleware to display server logs for each request
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Register routes
app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);

// ── Scores Endpoints ────────────────────────────────────────

// GET /api/scores - get all student scores
app.get('/api/scores', (req, res) => {
  res.json([...studentScores]);
});

// GET /api/scores/exam/:examId - get scores for specific exam
app.get('/api/scores/exam/:examId', (req, res) => {
  const examId = Number(req.params.examId);
  const filtered = studentScores.filter((s) => s.examId === examId);
  res.json(filtered);
});

// POST /api/scores - save student score
app.post('/api/scores', (req, res) => {
  const { studentId, studentName, examId, examTitle, score, date } = req.body;

  if (studentName === undefined || examId === undefined || score === undefined) {
    return res.status(400).json({ error: 'studentName, examId, and score are required' });
  }

  const scoreRecord = {
    studentId: studentId || null,
    studentName,
    examId: Number(examId),
    examTitle: examTitle || '',
    score: Number(score),
    date: date || new Date().toLocaleString()
  };

  studentScores.push(scoreRecord);
  res.status(201).json(scoreRecord);
});

// Start listening
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 ExamApp Server running on port ${PORT}`);
  console.log(`=========================================`);
});

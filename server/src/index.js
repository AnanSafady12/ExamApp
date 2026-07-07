import express from 'express';
import cors from 'cors';
import { users, exams, studentScores, ROLES } from './db.js';
import userRoutes from './routes/userRoutes.js';

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

// ── Exam CRUD Endpoints ─────────────────────────────────────

// GET /api/exams - get all exams
app.get('/api/exams', (req, res) => {
  res.json([...exams]);
});

// GET /api/exams/:id - get specific exam
app.get('/api/exams/:id', (req, res) => {
  const exam = exams.find((e) => e.id === Number(req.params.id));
  if (!exam) {
    return res.status(404).json({ error: 'Exam not found' });
  }
  res.json(exam);
});

// POST /api/exams - create new exam
app.post('/api/exams', (req, res) => {
  const { title, timeLimit, status, questions } = req.body;

  if (!title || !questions) {
    return res.status(400).json({ error: 'Title and questions are required' });
  }

  const newExam = {
    id: exams.length ? Math.max(...exams.map((e) => e.id)) + 1 : 1,
    title,
    timeLimit: timeLimit || 60,
    status: status || 'draft',
    questions
  };

  exams.push(newExam);
  res.status(201).json(newExam);
});

// PUT /api/exams/:id - update existing exam
app.put('/api/exams/:id', (req, res) => {
  const examId = Number(req.params.id);
  const index = exams.findIndex((e) => e.id === examId);

  if (index === -1) {
    return res.status(404).json({ error: 'Exam not found' });
  }

  exams[index] = { ...exams[index], ...req.body, id: examId }; // prevent changing ID
  res.json(exams[index]);
});

// DELETE /api/exams/:id - delete exam
app.delete('/api/exams/:id', (req, res) => {
  const index = exams.findIndex((e) => e.id === Number(req.params.id));

  if (index === -1) {
    return res.status(404).json({ error: 'Exam not found' });
  }

  exams.splice(index, 1);
  res.json({ success: true });
});

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

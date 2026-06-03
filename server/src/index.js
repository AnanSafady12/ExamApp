import express from 'express';
import cors from 'cors';
import { users, exams, studentScores, ROLES } from './db.js';

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

// ── Auth Endpoints ──────────────────────────────────────────

// Login endpoint
app.post('/api/users/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  
  // Return user details without password
  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

// Register endpoint
app.post('/api/users/register', (req, res) => {
  const { username, password, fullName, role } = req.body;

  if (!username || !password || !fullName || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!Object.values(ROLES).includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const exists = users.find((u) => u.username === username);
  if (exists) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  const newUser = {
    id: users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1,
    username,
    password,
    fullName,
    role
  };

  users.push(newUser);
  const { password: _, ...safeUser } = newUser;
  res.status(201).json(safeUser);
});

// Get user profile by username
app.get('/api/users/:username', (req, res) => {
  const { username } = req.params;
  const user = users.find((u) => u.username === username);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const { password: _, ...safeUser } = user;
  res.json(safeUser);
});

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
  const { title, status, questions } = req.body;

  if (!title || !questions) {
    return res.status(400).json({ error: 'Title and questions are required' });
  }

  const newExam = {
    id: exams.length ? Math.max(...exams.map((e) => e.id)) + 1 : 1,
    title,
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

// ============================================================
// Exam Service — async helpers that simulate network requests
// ============================================================

import { exams, studentScores } from './mockDb';

// Simulated network delay (ms)
const FAKE_DELAY = 600;

/**
 * Helper – wraps a value in a delayed Promise to mimic a fetch call.
 */
const simulateRequest = (data, delay = FAKE_DELAY) =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay));

// ── Exam CRUD ──────────────────────────────────────────────

/** GET  /exams          → returns all exams */
export const getAllExams = () => simulateRequest([...exams]);

/** GET  /exams/:id      → returns a single exam or null */
export const getExamById = (id) => {
  const exam = exams.find((e) => e.id === Number(id));
  return simulateRequest(exam || null);
};

/** POST /exams          → creates a new exam and returns it */
export const createExam = (exam) => {
  const newExam = {
    ...exam,
    id: exams.length ? Math.max(...exams.map((e) => e.id)) + 1 : 1,
  };
  exams.push(newExam);
  return simulateRequest(newExam);
};

/** PUT  /exams/:id      → updates an existing exam */
export const updateExam = (id, updates) => {
  const index = exams.findIndex((e) => e.id === Number(id));
  if (index === -1) return simulateRequest(null);
  exams[index] = { ...exams[index], ...updates };
  return simulateRequest(exams[index]);
};

/** DELETE /exams/:id    → deletes an exam */
export const deleteExam = (id) => {
  const index = exams.findIndex((e) => e.id === Number(id));
  if (index === -1) return simulateRequest(false);
  exams.splice(index, 1);
  return simulateRequest(true);
};

// ── Scores ─────────────────────────────────────────────────

/** GET  /scores         → returns all student scores */
export const getAllScores = () => simulateRequest([...studentScores]);

/** GET  /scores?examId= → returns scores for a specific exam */
export const getScoresByExam = (examId) => {
  const filtered = studentScores.filter((s) => s.examId === Number(examId));
  return simulateRequest(filtered);
};

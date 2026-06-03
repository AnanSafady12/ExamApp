// ============================================================
// Exam Service — async helpers that simulate network requests
// ============================================================

import { exams, studentScores } from './mockDb';
import configurationService from '../services/ConfigurationService';

// Simulated network delay (ms)
const FAKE_DELAY = 600;

/**
 * Helper – wraps a value in a delayed Promise to mimic a fetch call.
 */
const simulateRequest = (data, delay = FAKE_DELAY) =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay));

// ── Exam CRUD ──────────────────────────────────────────────

/** GET  /exams          → returns all exams */
export const getAllExams = async () => {
  if (configurationService.get('useServer')) {
    const serverUrl = configurationService.get('serverUrl');
    const response = await fetch(`${serverUrl}/api/exams`);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to fetch exams');
    }
    return await response.json();
  }

  return simulateRequest([...exams]);
};

/** GET  /exams/:id      → returns a single exam or null */
export const getExamById = async (id) => {
  if (configurationService.get('useServer')) {
    const serverUrl = configurationService.get('serverUrl');
    const response = await fetch(`${serverUrl}/api/exams/${id}`);
    if (response.status === 404) return null;
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to fetch exam');
    }
    return await response.json();
  }

  const exam = exams.find((e) => e.id === Number(id));
  return simulateRequest(exam || null);
};

/** POST /exams          → creates a new exam and returns it */
export const createExam = async (exam) => {
  if (configurationService.get('useServer')) {
    const serverUrl = configurationService.get('serverUrl');
    const response = await fetch(`${serverUrl}/api/exams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exam),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to create exam');
    }
    return await response.json();
  }

  const newExam = {
    ...exam,
    status: exam.status || 'draft',
    id: exams.length ? Math.max(...exams.map((e) => e.id)) + 1 : 1,
  };
  exams.push(newExam);
  return simulateRequest(newExam);
};

/** PUT  /exams/:id      → updates an existing exam */
export const updateExam = async (id, updates) => {
  if (configurationService.get('useServer')) {
    const serverUrl = configurationService.get('serverUrl');
    const response = await fetch(`${serverUrl}/api/exams/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (response.status === 404) return null;
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to update exam');
    }
    return await response.json();
  }

  const index = exams.findIndex((e) => e.id === Number(id));
  if (index === -1) return simulateRequest(null);
  exams[index] = { ...exams[index], ...updates };
  return simulateRequest(exams[index]);
};

/** DELETE /exams/:id    → deletes an exam */
export const deleteExam = async (id) => {
  if (configurationService.get('useServer')) {
    const serverUrl = configurationService.get('serverUrl');
    const response = await fetch(`${serverUrl}/api/exams/${id}`, {
      method: 'DELETE',
    });
    if (response.status === 404) return false;
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to delete exam');
    }
    return true;
  }

  const index = exams.findIndex((e) => e.id === Number(id));
  if (index === -1) return simulateRequest(false);
  exams.splice(index, 1);
  return simulateRequest(true);
};

// ── Scores ─────────────────────────────────────────────────

/** GET  /scores         → returns all student scores */
export const getAllScores = async () => {
  if (configurationService.get('useServer')) {
    const serverUrl = configurationService.get('serverUrl');
    const response = await fetch(`${serverUrl}/api/scores`);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to fetch scores');
    }
    return await response.json();
  }

  return simulateRequest([...studentScores]);
};

/** GET  /scores?examId= → returns scores for a specific exam */
export const getScoresByExam = async (examId) => {
  if (configurationService.get('useServer')) {
    const serverUrl = configurationService.get('serverUrl');
    const response = await fetch(`${serverUrl}/api/scores/exam/${examId}`);
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to fetch scores for exam');
    }
    return await response.json();
  }

  const filtered = studentScores.filter((s) => s.examId === Number(examId));
  return simulateRequest(filtered);
};

export const saveScore = async (scoreRecord) => {
  if (configurationService.get('useServer')) {
    const serverUrl = configurationService.get('serverUrl');
    const response = await fetch(`${serverUrl}/api/scores`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(scoreRecord),
    });
    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to save score');
    }
    return await response.json();
  }

  studentScores.push(scoreRecord);
  return simulateRequest(scoreRecord);
};

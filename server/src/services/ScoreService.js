import pool from '../db/connect.js';

class ScoreService {
  async saveSubmission(studentId, examId, answers) {
    // 1. Fetch the exam to get correct answers and calculate score securely
    const examResult = await pool.query(
      'SELECT questions FROM exams WHERE id = $1',
      [examId]
    );

    if (examResult.rows.length === 0) {
      throw new Error('Exam not found');
    }

    const questions = examResult.rows[0].questions;
    if (!questions || questions.length === 0) {
      throw new Error('Exam has no questions');
    }

    let correctCount = 0;
    questions.forEach((q) => {
      const studentAns = answers[q.id];
      const correctAns = q.correctAnswer;

      let isCorrect = false;
      if (q.type === 'SHORT_ANSWER') {
        isCorrect =
          studentAns !== undefined &&
          studentAns !== null &&
          String(studentAns).trim().toLowerCase() === String(correctAns).trim().toLowerCase();
      } else {
        isCorrect =
          studentAns !== undefined &&
          studentAns !== null &&
          String(studentAns) === String(correctAns);
      }

      if (isCorrect) {
        correctCount++;
      }
    });

    const scorePercentage = Math.round((correctCount / questions.length) * 100);

    // 2. Save the submission to the database
    const result = await pool.query(
      `INSERT INTO submissions (exam_id, student_id, score, answers)
       VALUES ($1, $2, $3, $4)
       RETURNING id, exam_id AS "examId", student_id AS "studentId", score, answers, submitted_at AS "date"`,
      [examId, studentId, scorePercentage, JSON.stringify(answers)]
    );

    return result.rows[0];
  }

  async getScoresByExamId(examId) {
    const result = await pool.query(
      `SELECT 
         s.id,
         s.exam_id AS "examId",
         e.title AS "examTitle",
         s.student_id AS "studentId",
         u.name AS "studentName",
         s.score,
         s.answers,
         s.submitted_at AS "date"
       FROM submissions s
       JOIN users u ON s.student_id = u.id
       JOIN exams e ON s.exam_id = e.id
       WHERE s.exam_id = $1
       ORDER BY s.submitted_at DESC`,
      [examId]
    );
    return result.rows;
  }

  async getSubmissionsByStudentId(studentId) {
    const result = await pool.query(
      `SELECT 
         s.id,
         s.exam_id AS "examId",
         e.title AS "examTitle",
         s.student_id AS "studentId",
         u.name AS "studentName",
         s.score,
         s.answers,
         s.submitted_at AS "date",
         e.results_released AS "resultsReleased"
       FROM submissions s
       JOIN users u ON s.student_id = u.id
       JOIN exams e ON s.exam_id = e.id
       WHERE s.student_id = $1
       ORDER BY s.submitted_at DESC`,
      [studentId]
    );
    return result.rows;
  }
}

export default new ScoreService();

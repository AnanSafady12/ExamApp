import pool from '../db/connect.js';

class ExamService {
  async getAllExams() {
    const result = await pool.query(
      'SELECT id, title, time_limit AS "timeLimit", passing_grade AS "passingGrade", questions, status, results_released AS "resultsReleased" FROM exams ORDER BY created_at DESC'
    );
    return result.rows;
  }

  async getExamById(id) {
    const result = await pool.query(
      'SELECT id, title, time_limit AS "timeLimit", passing_grade AS "passingGrade", questions, status, results_released AS "resultsReleased" FROM exams WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  async createExam({ title, timeLimit, passingGrade, questions, status }) {
    const result = await pool.query(
      'INSERT INTO exams (title, time_limit, passing_grade, questions, status) VALUES ($1, $2, $3, $4, $5) RETURNING id, title, time_limit AS "timeLimit", passing_grade AS "passingGrade", questions, status, results_released AS "resultsReleased"',
      [
        title,
        timeLimit || 60,
        passingGrade || 60,
        JSON.stringify(questions || []),
        status || 'draft'
      ]
    );
    return result.rows[0];
  }

  async updateExam(id, updates) {
    const fields = [];
    const values = [];
    let idx = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${idx++}`);
      values.push(updates.title);
    }
    if (updates.timeLimit !== undefined) {
      fields.push(`time_limit = $${idx++}`);
      values.push(updates.timeLimit);
    }
    if (updates.passingGrade !== undefined) {
      fields.push(`passing_grade = $${idx++}`);
      values.push(updates.passingGrade);
    }
    if (updates.questions !== undefined) {
      fields.push(`questions = $${idx++}`);
      values.push(JSON.stringify(updates.questions));
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${idx++}`);
      values.push(updates.status);
    }
    if (updates.resultsReleased !== undefined) {
      fields.push(`results_released = $${idx++}`);
      values.push(updates.resultsReleased);
    }

    if (fields.length === 0) {
      return this.getExamById(id);
    }

    values.push(id);
    const query = `
      UPDATE exams 
      SET ${fields.join(', ')} 
      WHERE id = $${idx} 
      RETURNING id, title, time_limit AS "timeLimit", passing_grade AS "passingGrade", questions, status, results_released AS "resultsReleased"
    `;
    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async deleteExam(id) {
    const result = await pool.query('DELETE FROM exams WHERE id = $1', [id]);
    return result.rowCount > 0;
  }

  async publishResults(id) {
    const result = await pool.query(
      'UPDATE exams SET results_released = true WHERE id = $1 RETURNING id, title, results_released AS "resultsReleased"',
      [id]
    );
    return result.rows[0];
  }
}

export default new ExamService();

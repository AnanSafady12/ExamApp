import ExamService from '../services/ExamService.js';

class ExamController {
  async getAllExams(req, res) {
    try {
      const exams = await ExamService.getAllExams();
      res.json(exams);
    } catch (error) {
      console.error('Error in getAllExams controller:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getExamById(req, res) {
    try {
      const { id } = req.params;
      const exam = await ExamService.getExamById(id);
      if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
      }
      res.json(exam);
    } catch (error) {
      console.error('Error in getExamById controller:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createExam(req, res) {
    try {
      const { title, timeLimit, passingGrade, questions, status } = req.body;
      if (!title) {
        return res.status(400).json({ error: 'Exam title is required' });
      }

      const exam = await ExamService.createExam({
        title,
        timeLimit,
        passingGrade,
        questions,
        status
      });
      res.status(201).json(exam);
    } catch (error) {
      console.error('Error in createExam controller:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateExam(req, res) {
    try {
      const { id } = req.params;
      const updated = await ExamService.updateExam(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Exam not found' });
      }
      res.json(updated);
    } catch (error) {
      console.error('Error in updateExam controller:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteExam(req, res) {
    try {
      const { id } = req.params;
      const success = await ExamService.deleteExam(id);
      if (!success) {
        return res.status(404).json({ error: 'Exam not found' });
      }
      res.json({ success: true });
    } catch (error) {
      console.error('Error in deleteExam controller:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async publishResults(req, res) {
    try {
      const { id } = req.params;
      const exam = await ExamService.publishResults(id);
      if (!exam) {
        return res.status(404).json({ error: 'Exam not found' });
      }
      res.json({ success: true, exam });
    } catch (error) {
      console.error('Error in publishResults controller:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new ExamController();

import ScoreService from '../services/ScoreService.js';
import { clearStudentChat } from '../services/socketHandler.js';

class ScoreController {
  async submit(req, res) {
    try {
      const { examId, answers } = req.body;
      const studentId = req.user.id;

      if (!examId || !answers) {
        return res.status(400).json({ error: 'examId and answers are required' });
      }

      const scoreRecord = await ScoreService.saveSubmission(studentId, examId, answers);
      
      // Clear the student's chat history from the live monitor
      clearStudentChat(examId, studentId);

      res.status(201).json(scoreRecord);
    } catch (error) {
      console.error('Error in submit controller:', error);
      res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  async getExamScores(req, res) {
    try {
      const { examId } = req.params;
      const scores = await ScoreService.getScoresByExamId(examId);
      res.json(scores);
    } catch (error) {
      console.error('Error in getExamScores controller:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getStudentScores(req, res) {
    try {
      const studentId = req.user.id;
      const submissions = await ScoreService.getSubmissionsByStudentId(studentId);
      res.json(submissions);
    } catch (error) {
      console.error('Error in getStudentScores controller:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new ScoreController();

import express from 'express';
import ScoreController from '../controllers/ScoreController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

const requireRole = (role) => (req, res, next) => {
  if (req.user && req.user.role === role) {
    next();
  } else {
    res.status(403).json({ error: `Access denied: ${role} role required` });
  }
};

router.use(authenticateToken);

// Student submits an exam
router.post('/', requireRole('STUDENT'), ScoreController.submit);

// Student retrieves their own history
router.get('/student', requireRole('STUDENT'), ScoreController.getStudentScores);

// Teacher retrieves scores for a specific exam
router.get('/exam/:examId', requireRole('TEACHER'), ScoreController.getExamScores);

export default router;

import express from 'express';
import ExamController from '../controllers/ExamController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

const requireTeacher = (req, res, next) => {
  if (req.user && req.user.role === 'TEACHER') {
    next();
  } else {
    res.status(403).json({ error: 'Access denied: Teacher role required' });
  }
};

// All exam routes require authentication
router.use(authenticateToken);

router.get('/', ExamController.getAllExams);
router.get('/:id', ExamController.getExamById);

// Teacher-only actions
router.post('/', requireTeacher, ExamController.createExam);
router.put('/:id', requireTeacher, ExamController.updateExam);
router.delete('/:id', requireTeacher, ExamController.deleteExam);
router.post('/:id/publish-results', requireTeacher, ExamController.publishResults);

export default router;

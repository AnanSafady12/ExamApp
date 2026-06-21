import { useEffect, useState } from 'react';
import { getAllExams, getExamById, saveScore } from './api/examService';
import StudentExamList from './components/StudentExamList';
import ExamTakingView from './components/ExamTakingView';
import notificationService from './services/NotificationService';
import loggerService from './services/LoggerService';
import authService from './services/AuthService';

// Renders the workspace for students to view active assessments and take tests
function StudentPortal() {
  const [exams, setExams] = useState([]);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  // Fetch only the published exams to prevent students seeing draft/closed ones
  const fetchPublishedExams = async () => {
    setLoading(true);
    setError('');
    try {
      const allExams = await getAllExams();
      const publishedExams = allExams.filter((e) => e.status === 'published');
      setExams(publishedExams);
    } catch (err) {
      setError('Failed to fetch exams.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch active published exams when the student portal loads
  useEffect(() => {
    fetchPublishedExams();
  }, []);

  // Sets up local workspace states to start taking a selected test
  const handleStartExam = (selectedExam) => {
    setExam(selectedExam);
    setAnswers({});
    setSubmitted(false);
    setError('');
  };

  // Tracks student's selected choice for a specific question
  const handleSelectAnswer = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  // Submits the test answers, calculates scores, and pushes records to mock DB
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Re-fetch the exam status from mock DB to ensure the teacher didn't close it mid-test
      const latest = await getExamById(exam.id);
      if (!latest || latest.status !== 'published') {
        setError('This exam is closed and can no longer be submitted.');
        notificationService.error(`Submission failed: Exam "${exam.title}" is closed.`);
        loggerService.error(`Failed submission attempt for closed exam ID ${exam.id}`);
        return;
      }
      
      const currentUser = authService.getCurrentUser();
      const studentName = currentUser ? currentUser.fullName : 'Anonymous';
      const studentId = currentUser ? currentUser.id : null;
      
      // Calculate correct vs incorrect answers
      const score = exam.questions.reduce(
        (acc, q) => acc + (answers[q.id] === q.correctAnswer ? 1 : 0),
        0
      );
      
      const scorePercentage = exam.questions.length
        ? Math.round((score / exam.questions.length) * 100)
        : 0;
      
      const date = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      
      // Persist the score record in the mock database
      await saveScore({
        studentId,
        studentName,
        examId: Number(exam.id),
        examTitle: exam.title,
        score: scorePercentage,
        date,
      });
      
      setSubmitted(true);
      notificationService.success(`Exam "${exam.title}" submitted successfully.`);
      loggerService.success(`Student ${studentName} submitted exam ID ${exam.id} with score ${scorePercentage}%`);
    } catch (err) {
      setError('An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  // Reset exam state variables and reload active published test lists
  const handleExitExam = () => {
    setExam(null);
    setAnswers({});
    setSubmitted(false);
    setError('');
    fetchPublishedExams();
  };

  return (
    <div className="student-portal animate-in">
      {/* Header section with page title and exit button */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">🎓 Student Portal</h2>
          <p className="text-muted mb-0">Welcome to your online assessment center</p>
        </div>
        {exam && (
          <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={handleExitExam}>
            Exit Exam
          </button>
        )}
      </div>

      {/* Show loader spinner when loading lists of available exams */}
      {loading && !exam && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Render list of active exams when no exam is actively running */}
      {!loading && !exam && (
        <StudentExamList exams={exams} onStartExam={handleStartExam} />
      )}

      {/* Render test taking interface when a student has opened an exam */}
      {exam && (
        <ExamTakingView
          exam={exam}
          answers={answers}
          submitted={submitted}
          error={error}
          loading={loading}
          onSelectAnswer={handleSelectAnswer}
          onSubmit={handleSubmit}
          onExit={handleExitExam}
        />
      )}
    </div>
  );
}

export default StudentPortal;

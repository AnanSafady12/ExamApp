import { useEffect, useState } from 'react';
import { getAllExams, getExamById } from './api/examService';
import StudentExamList from './components/StudentExamList';
import ExamTakingView from './components/ExamTakingView';
import notificationService from './services/NotificationService';
import loggerService from './services/LoggerService';

function StudentPortal() {
  const [exams, setExams] = useState([]);
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

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

  useEffect(() => {
    fetchPublishedExams();
  }, []);

  const handleStartExam = (selectedExam) => {
    setExam(selectedExam);
    setAnswers({});
    setSubmitted(false);
    setError('');
  };

  const handleSelectAnswer = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const latest = await getExamById(exam.id);
      if (!latest || latest.status !== 'published') {
        setError('This exam is closed and can no longer be submitted.');
        notificationService.error(`Submission failed: Exam "${exam.title}" is closed.`);
        loggerService.error(`Failed submission attempt for closed exam ID ${exam.id}`);
        return;
      }
      setSubmitted(true);
      notificationService.success(`Exam "${exam.title}" submitted successfully.`);
      loggerService.success(`Student submitted exam ID ${exam.id}`);
    } catch (err) {
      setError('An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  const handleExitExam = () => {
    setExam(null);
    setAnswers({});
    setSubmitted(false);
    setError('');
    fetchPublishedExams();
  };

  return (
    <div className="student-portal animate-in">
      <style>{`
        .animate-in {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .option-btn {
          text-align: left;
          transition: all 0.2s ease;
          border-width: 2px;
          border-radius: 12px;
          padding: 12px 20px;
          margin-bottom: 10px;
          width: 100%;
          font-weight: 500;
        }
        .option-btn:not(:disabled):hover {
          transform: translateX(5px);
          background-color: #f8f9fa;
          border-color: #0d6efd;
        }
        .option-btn.active {
          background-color: #e7f1ff;
          border-color: #0d6efd;
          color: #084298;
        }
        .exam-card {
          border: none;
          border-radius: 20px;
          overflow: hidden;
        }
        .question-box {
          background: #ffffff;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          border: 1px solid #e9ecef;
          transition: box-shadow 0.3s ease;
        }
        .question-box:hover {
          box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }
        .score-display {
          background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%);
          color: white;
          border-radius: 16px;
          padding: 30px;
          text-align: center;
          margin-top: 20px;
        }
        .search-container {
          background-color: #f8f9fa;
          border-radius: 24px;
          padding: 40px;
          text-align: center;
          border: 1px dashed #dee2e6;
        }
      `}</style>

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

      {loading && !exam && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {!loading && !exam && (
        <StudentExamList exams={exams} onStartExam={handleStartExam} />
      )}

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

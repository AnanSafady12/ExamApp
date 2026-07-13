import { useEffect, useState } from 'react';
import { getAllExams, getExamById, saveScore, getStudentSubmissions } from './api/examService';
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
  
  // Navigation tabs state ('exams' or 'history')
  const [activeTab, setActiveTab] = useState('exams');
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [examCache, setExamCache] = useState({});
  const [expandedSubmissions, setExpandedSubmissions] = useState({});

  const loadPortalData = async () => {
    setLoading(true);
    setError('');
    setHistoryLoading(true);
    try {
      const [allExams, studentHistory] = await Promise.all([
        getAllExams(),
        getStudentSubmissions()
      ]);

      setHistory(studentHistory);
      
      const takenExamIds = new Set(studentHistory.map(sub => sub.examId));
      const publishedExams = allExams.filter((e) => e.status === 'published' && !takenExamIds.has(e.id));
      setExams(publishedExams);
    } catch (err) {
      setError('Failed to fetch exams and history.');
    } finally {
      setLoading(false);
      setHistoryLoading(false);
    }
  };

  // Fetch data when the student portal loads
  useEffect(() => {
    loadPortalData();
  }, []);

  const fetchHistory = async () => {
    // History is now already loaded, but we can keep this for manual refresh if needed
    if (history.length === 0) {
      await loadPortalData();
    }
  };

  const handleToggleExpand = async (subId, examId) => {
    setExpandedSubmissions((prev) => ({
      ...prev,
      [subId]: !prev[subId],
    }));

    if (!examCache[examId]) {
      try {
        const examData = await getExamById(examId);
        if (examData) {
          setExamCache((prev) => ({
            ...prev,
            [examId]: examData,
          }));
        }
      } catch (err) {
        console.error('Failed to fetch exam details for history view:', err);
      }
    }
  };

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

  // Submits the test answers, calculates scores, and pushes records to DB
  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Re-fetch the exam status from DB to ensure the teacher didn't close it mid-test
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
      const score = exam.questions.reduce((acc, q) => {
        const studentAns = answers[q.id] || '';
        const correctAns = q.correctAnswer || '';
        const isCorrect = q.type === 'SHORT_ANSWER'
          ? studentAns.trim().toLowerCase() === correctAns.trim().toLowerCase()
          : studentAns === correctAns;
        return acc + (isCorrect ? 1 : 0);
      }, 0);
      
      const scorePercentage = exam.questions.length
        ? Math.round((score / exam.questions.length) * 100)
        : 0;
      
      const date = new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
      
      // Persist the score record in the database
      await saveScore({
        studentId,
        studentName,
        examId: exam.id,
        examTitle: exam.title,
        score: scorePercentage,
        date,
        answers, // Include exact answers submitted by student
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
    loadPortalData();
  };

  return (
    <div className="student-portal animate-in">
      {/* Header section with page title */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-0 text-dark">🎓 Student Portal</h2>
        </div>
      </div>

      {/* Navigation tabs */}
      {!exam && (
        <div className="d-flex gap-2 mb-4 border-bottom pb-2">
          <button
            className={`btn btn-sm ${activeTab === 'exams' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => setActiveTab('exams')}
            style={{ borderRadius: '8px' }}
          >
            📝 Available Exams
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'history' ? 'btn-primary' : 'btn-outline-secondary'}`}
            onClick={() => {
              setActiveTab('history');
              fetchHistory();
            }}
            style={{ borderRadius: '8px' }}
          >
            📊 My Grade History
          </button>
        </div>
      )}

      {/* Show loader spinner when loading lists of available exams */}
      {loading && !exam && activeTab === 'exams' && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Render list of active exams when no exam is actively running */}
      {!loading && !exam && activeTab === 'exams' && (
        <StudentExamList exams={exams} onStartExam={handleStartExam} />
      )}

      {/* Render student grade history tab */}
      {!loading && !exam && activeTab === 'history' && (
        <div>
          {historyLoading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : history.length === 0 ? (
            <div className="card-premium text-center p-5">
              <p className="text-muted mb-0">No past submissions found.</p>
            </div>
          ) : (
            <div className="d-flex flex-column gap-3">
              {history.map((sub) => {
                const isExpanded = expandedSubmissions[sub.id];
                const examDetails = examCache[sub.examId];

                return (
                  <div key={sub.id} className="card-premium p-4">
                    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                      <div>
                        <h5 className="fw-bold mb-1">{sub.examTitle}</h5>
                        <p className="text-muted small mb-0">Submitted on: {sub.date}</p>
                      </div>
                      <div className="d-flex align-items-center gap-3">
                        <span className="badge bg-primary fs-6 p-2 rounded-3">
                          Score: {sub.score}%
                        </span>
                        {sub.resultsReleased ? (
                          <button
                            className="btn btn-outline-primary btn-sm rounded-pill"
                            onClick={() => handleToggleExpand(sub.id, sub.examId)}
                          >
                            {isExpanded ? 'Hide Details' : 'Review Answers'}
                          </button>
                        ) : (
                          <span className="text-muted small italic">Results pending release</span>
                        )}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mt-4 pt-4 border-top">
                        {examDetails ? (
                          <div className="d-flex flex-column gap-3">
                            <h6 className="fw-bold text-muted small text-uppercase mb-2">Question breakdown</h6>
                            {examDetails.questions.map((q, idx) => {
                              const studentAns = sub.answers[q.id] || '';
                              const correctAns = q.correctAnswer || '';
                              const isCorrect = q.type === 'SHORT_ANSWER'
                                ? studentAns.trim().toLowerCase() === correctAns.trim().toLowerCase()
                                : studentAns === correctAns;

                              return (
                                <div key={q.id} className="p-3 border rounded-3 bg-light">
                                  <p className="fw-bold mb-2">Q{idx + 1}: {q.text}</p>
                                  <div className="small">
                                    <p className={`mb-1 ${isCorrect ? 'text-success' : 'text-danger'}`}>
                                      <strong>Your Answer:</strong> {studentAns || '(No answer provided)'} {isCorrect ? '✓' : '✕'}
                                    </p>
                                    {!isCorrect && (
                                      <p className="text-success mb-0">
                                        <strong>Correct Answer:</strong> {correctAns}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-3">
                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                              <span className="visually-hidden">Loading details...</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
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

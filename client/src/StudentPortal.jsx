import { useState } from 'react';
import { getExamById } from './api/examService';
import notificationService from './services/NotificationService';
import loggerService from './services/LoggerService';

function StudentPortal() {
  const [examId, setExamId] = useState('');
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleFetchExam = async () => {
    if (!examId.trim()) {
      setError('Please enter a valid Exam ID.');
      return;
    }

    setLoading(true);
    setError('');
    setExam(null);
    setAnswers({});
    setSubmitted(false);

    const result = await getExamById(examId);

    if (!result || result.status !== 'published') {
      setError(`No exam found with ID "${examId}".`);
    } else {
      setExam(result);
    }

    setLoading(false);
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

  const handleReset = () => {
    setExam(null);
    setExamId('');
    setError('');
    setAnswers({});
    setSubmitted(false);
  };

  // Calculate score after submission
  const getScore = () => {
    if (!exam) return 0;
    return exam.questions.reduce(
      (acc, q) => acc + (answers[q.id] === q.correctAnswer ? 1 : 0),
      0,
    );
  };

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

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

      {/* ── Header ───────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold mb-1">🎓 Student Portal</h2>
          <p className="text-muted mb-0">Welcome to your online assessment center</p>
        </div>
        {exam && (
          <button className="btn btn-outline-secondary btn-sm rounded-pill px-3" onClick={handleReset}>
            Exit Exam
          </button>
        )}
      </div>

      {/* ── Search bar (Initial State) ─────────────────── */}
      {!exam && (
        <div className="search-container shadow-sm mx-auto" style={{ maxWidth: 600 }}>
          <div className="mb-4">
            <span className="display-4">📝</span>
            <h3 className="mt-3 fw-bold">Ready to Start?</h3>
            <p className="text-muted">Enter the Exam ID provided by your instructor to begin your assessment.</p>
          </div>
          
          <div className="input-group input-group-lg mb-3 shadow-sm rounded-pill overflow-hidden">
            <input
              type="text"
              className="form-control border-0 ps-4"
              placeholder="Exam ID (e.g., 1, 2, 3)"
              value={examId}
              onChange={(e) => setExamId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleFetchExam()}
            />
            <button 
              className="btn btn-primary px-4 fw-bold" 
              onClick={handleFetchExam} 
              disabled={loading}
              style={{ minWidth: 140 }}
            >
              {loading ? (
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              ) : 'Start Exam'}
            </button>
          </div>
          
          {error && (
            <div className="alert alert-danger rounded-4 py-2 mt-3 animate-in" role="alert">
              <span className="me-2">⚠️</span>
              {error}
            </div>
          )}
          
          <div className="mt-4 pt-2 border-top">
            <small className="text-muted">Currently available: IDs 1, 2, and 3</small>
          </div>
        </div>
      )}

      {/* ── Exam View ────────────────────────────────── */}
      {exam && (
        <div className="exam-view animate-in">
          <div className="card exam-card shadow-lg mb-5">
            <div className="card-header bg-white border-bottom py-4 px-4 d-flex justify-content-between align-items-center">
              <div>
                <span className="badge bg-primary-subtle text-primary rounded-pill mb-2 px-3 py-2">Active Assessment</span>
                <h3 className="card-title fw-bold mb-0">{exam.title}</h3>
                <p className="text-muted small mb-0 mt-1">
                  <span className="me-3">📅 {today}</span>
                  <span>❓ {exam.questions.length} Questions</span>
                </p>
              </div>
              {submitted && (
                <div className="text-end">
                  <div className="h4 fw-bold mb-0 text-primary">{Math.round((getScore() / exam.questions.length) * 100)}%</div>
                  <div className="small text-muted">Final Grade</div>
                </div>
              )}
            </div>
            
            <div className="card-body bg-light py-4 px-4">
              <div className="row justify-content-center">
                <div className="col-lg-10">
                  {exam.questions.map((q, idx) => (
                    <div key={q.id} className="question-box shadow-sm">
                      <div className="d-flex mb-3">
                        <span className="badge bg-dark rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: 28, height: 28, flexShrink: 0 }}>
                          {idx + 1}
                        </span>
                        <h5 className="fw-bold mb-0 pt-1">{q.text}</h5>
                      </div>
                      
                      <div className="options-list mt-4">
                        {q.options.map((opt) => {
                          let btnClass = 'option-btn btn btn-outline-secondary';
                          if (submitted) {
                            if (opt === q.correctAnswer) {
                              btnClass = 'option-btn btn btn-success';
                            } else if (answers[q.id] === opt && opt !== q.correctAnswer) {
                              btnClass = 'option-btn btn btn-danger';
                            } else {
                              btnClass = 'option-btn btn btn-outline-secondary opacity-50';
                            }
                          } else if (answers[q.id] === opt) {
                            btnClass = 'option-btn btn btn-primary active shadow-sm';
                          }

                          return (
                            <button
                              key={opt}
                              className={btnClass}
                              disabled={submitted}
                              onClick={() => handleSelectAnswer(q.id, opt)}
                            >
                              <div className="d-flex justify-content-between align-items-center w-100">
                                <span>{opt}</span>
                                {!submitted && answers[q.id] === opt && (
                                  <span className="badge bg-white text-primary rounded-circle p-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                                      <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.446z"/>
                                    </svg>
                                  </span>
                                )}
                                {submitted && opt === q.correctAnswer && (
                                  <span className="badge bg-white text-success rounded-circle p-1">✓</span>
                                )}
                                {submitted && answers[q.id] === opt && opt !== q.correctAnswer && (
                                  <span className="badge bg-white text-danger rounded-circle p-1">✕</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  {!submitted ? (
                    <div className="d-grid gap-2 mt-5">
                      {error && (
                        <div className="alert alert-danger rounded-4 py-2 mb-3 animate-in" role="alert">
                          <span className="me-2">⚠️</span>
                          {error}
                        </div>
                      )}
                      <button 
                        className="btn btn-primary btn-lg rounded-pill py-3 fw-bold shadow" 
                        onClick={handleSubmit}
                        disabled={Object.keys(answers).length < exam.questions.length}
                      >
                        Submit Assessment
                      </button>
                      {Object.keys(answers).length < exam.questions.length && (
                        <p className="text-center text-muted small mt-2">
                          Please answer all {exam.questions.length} questions to submit.
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="score-display shadow-lg animate-in">
                      <h2 className="fw-bold mb-2">Assessment Completed!</h2>
                      <p className="mb-4 opacity-75">Great job completing the {exam.title} exam.</p>
                      <div className="display-2 fw-bold mb-2">
                        {getScore()} <small className="h4 opacity-75">/ {exam.questions.length}</small>
                      </div>
                      <p className="h5 mb-4">You scored {Math.round((getScore() / exam.questions.length) * 100)}%</p>
                      <div className="d-flex justify-content-center gap-3 mt-4">
                        <button className="btn btn-light rounded-pill px-4" onClick={handleReset}>
                          Take Another Exam
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentPortal;

import { useState, useEffect } from 'react';
import QuestionCard from './QuestionCard';

// Renders the active test-taking UI panel for a student taking a published exam
function ExamTakingView({
  exam,
  answers,
  submitted,
  error,
  loading,
  onSelectAnswer,
  onSubmit,
  onExit,
}) {
  // Initialize timeLeft using exam.timeLimit (in minutes) converted to seconds. Default to 60 if not provided.
  const [timeLeft, setTimeLeft] = useState((exam.timeLimit || 60) * 60);

  // Timer countdown effect
  useEffect(() => {
    // Stop the timer if submitted or time is up
    if (submitted || timeLeft <= 0) return;

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          // Auto-submit when time is up
          onSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [submitted, timeLeft, onSubmit]);

  // Format timeLeft into MM:SS
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Count the number of correct choices selected
  const score = exam.questions.reduce(
    (acc, q) => acc + (answers[q.id] === q.correctAnswer ? 1 : 0),
    0
  );

  // Calculates the final score percentage
  const scorePercentage = exam.questions.length
    ? Math.round((score / exam.questions.length) * 100)
    : 0;

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="exam-view animate-in">
      <div className="card-premium" style={{ padding: '0px', overflow: 'hidden' }}>
        
        {/* Header segment showing exam details and dynamic grades summary */}
        <div className="border-bottom py-4 px-4 d-flex justify-content-between align-items-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
          <div>
            <span className="badge-role badge-published mb-2 align-self-start">
              Active Assessment
            </span>
            <h3 className="fw-bold mb-0 mt-1" style={{ color: 'var(--text-h)', fontSize: '1.4rem' }}>{exam.title}</h3>
            <p className="text-muted small mb-0 mt-1" style={{ fontSize: '13px' }}>
              <span className="me-3">📅 {today}</span>
              <span>📋 {exam.questions.length} Question{exam.questions.length !== 1 && 's'}</span>
            </p>
          </div>
          {!submitted ? (
            <div className="text-end">
              <span className={`fw-bold px-3 py-2 rounded-3 ${timeLeft < 60 ? 'bg-danger text-white' : ''}`} style={{ background: timeLeft < 60 ? '' : 'var(--primary-light)', color: timeLeft < 60 ? '' : 'var(--primary)', fontSize: '18px', transition: 'all 0.3s' }}>
                ⏱ {formatTime(timeLeft)}
              </span>
              <div className="small text-muted mt-1 fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>Time Remaining</div>
            </div>
          ) : (
            <div className="text-end">
              <span className="fw-bold px-3 py-2 rounded-3" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '18px' }}>
                {scorePercentage}%
              </span>
              <div className="small text-muted mt-1 fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>Final Grade</div>
            </div>
          )}
        </div>

        <div className="py-4 px-4">
          <div className="row justify-content-center">
            <div className="col-lg-10 col-md-11">
              
              {/* Map and render each question dynamically as a QuestionCard component */}
              <div className="d-flex flex-column gap-1">
                {exam.questions.map((q, idx) => (
                  <QuestionCard
                    key={q.id}
                    question={q}
                    idx={idx}
                    answers={answers}
                    submitted={submitted}
                    onSelectAnswer={onSelectAnswer}
                  />
                ))}
              </div>

              {/* Renders the submission controls if not yet completed */}
              {!submitted ? (
                <div className="d-grid gap-2 mt-4">
                  {/* Displays validation errors if double checks fail */}
                  {error && (
                    <div className="alert alert-danger border-0 py-2 mb-3 text-center" style={{ borderRadius: '12px', background: 'var(--danger-light)', color: 'var(--danger)' }} role="alert">{error}</div>
                  )}
                  
                  {/* Submit button stays disabled until all questions are answered */}
                  <button
                    className="btn-primary-custom w-100 fw-bold py-3 fs-5"
                    onClick={onSubmit}
                    disabled={loading || Object.keys(answers).length < exam.questions.length}
                  >
                    {loading ? (
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    ) : (
                      'Submit Assessment'
                    )}
                  </button>
                  {Object.keys(answers).length < exam.questions.length && (
                    <p className="text-center text-muted small mt-2" style={{ fontSize: '13px' }}>
                      Please answer all {exam.questions.length} questions to submit.
                    </p>
                  )}
                </div>
              ) : (
                /* Renders the final grades percentage summaries and correct highlights */
                <div className="p-5 text-center mt-4 rounded-4 shadow" style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)', color: '#fff' }}>
                  <h2 className="fw-bold mb-2 text-white" style={{ fontFamily: 'var(--heading)' }}>Assessment Completed!</h2>
                  <p className="mb-4 opacity-75" style={{ fontSize: '15px' }}>Great job completing the {exam.title} exam.</p>
                  <div className="display-2 fw-bold mb-2 text-white">
                    {score} <span className="fs-3 opacity-70">/ {exam.questions.length}</span>
                  </div>
                  <p className="h4 mb-4 text-white" style={{ opacity: 0.9 }}>Your Grade: {scorePercentage}%</p>
                  <div className="d-flex justify-content-center gap-3 mt-4">
                    <button className="btn btn-light rounded-pill px-4 py-2 fw-bold" onClick={onExit} style={{ border: 'none', color: 'var(--primary)', transition: 'all 0.2s' }}>
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
  );
}

export default ExamTakingView;

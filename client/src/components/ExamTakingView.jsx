import { useState, useEffect } from 'react';
import QuestionCard from './QuestionCard';
import ChatWidget from './ChatWidget';

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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

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

  // Count the number of correct choices selected (case-insensitive for short answers)
  const score = exam.questions.reduce((acc, q) => {
    const studentAns = answers[q.id] || '';
    const correctAns = q.correctAnswer || '';
    const isCorrect = q.type === 'SHORT_ANSWER'
      ? studentAns.trim().toLowerCase() === correctAns.trim().toLowerCase()
      : studentAns === correctAns;
    return acc + (isCorrect ? 1 : 0);
  }, 0);

  // Calculates the final score percentage
  const scorePercentage = exam.questions.length
    ? Math.round((score / exam.questions.length) * 100)
    : 0;

  // Check if every question in the assessment has been answered
  const allAnswered = exam.questions.every(
    (q) => answers[q.id] !== undefined && answers[q.id] !== null && answers[q.id].toString().trim() !== ''
  );

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
            <div className="d-flex align-items-center gap-3">
              <ChatWidget 
                examId={exam.id} 
                currentQuestionIndex={currentQuestionIndex}
                totalQuestions={exam.questions.length}
                timeLeft={timeLeft}
              />
              <div className="text-end">
                <span className={`fw-bold px-3 py-2 rounded-3 ${timeLeft < 60 ? 'bg-danger text-white' : ''}`} style={{ background: timeLeft < 60 ? '' : 'var(--primary-light)', color: timeLeft < 60 ? '' : 'var(--primary)', fontSize: '18px', transition: 'all 0.3s' }}>
                  ⏱ {formatTime(timeLeft)}
                </span>
                <div className="small text-muted mt-1 fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>Time Remaining</div>
              </div>
            </div>
          ) : (
            <div className="text-end">
              {exam.resultsReleased ? (
                <>
                  <span className="fw-bold px-3 py-2 rounded-3" style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: '18px' }}>
                    {scorePercentage}%
                  </span>
                  <div className="small text-muted mt-1 fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>Final Grade</div>
                </>
              ) : (
                <>
                  <span className="fw-bold px-3 py-2 rounded-3" style={{ background: 'var(--success)', color: '#fff', fontSize: '15px' }}>
                    Submitted
                  </span>
                  <div className="small text-muted mt-1 fw-bold text-uppercase" style={{ fontSize: '10px', letterSpacing: '0.05em' }}>Pending Review</div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="py-4 px-4">
          {!submitted ? (
            <div className="row">
              {/* Sidebar: Navigation and Submit */}
              <div className="col-md-4 col-lg-3 border-end pe-4 mb-4 mb-md-0">
                <h5 className="fw-bold mb-3" style={{ color: 'var(--text-h)' }}>Questions</h5>
                <div className="d-flex flex-wrap gap-2 mb-4">
                  {exam.questions.map((q, idx) => {
                    const isAnswered = !!answers[q.id] && answers[q.id].toString().trim() !== '';
                    const isActive = idx === currentQuestionIndex;
                    let btnClass = 'btn-outline-secondary';
                    if (isActive) {
                      btnClass = 'btn-primary text-white';
                    } else if (isAnswered) {
                      btnClass = 'btn-success text-white border-success';
                    }
                    
                    return (
                      <button
                        key={q.id}
                        className={`btn ${btnClass} btn-sm d-flex align-items-center justify-content-center fw-bold`}
                        style={{ width: '40px', height: '40px', borderRadius: '8px', transition: 'all 0.2s' }}
                        onClick={() => setCurrentQuestionIndex(idx)}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <div className="d-grid gap-2 mt-auto">
                  {error && (
                    <div className="alert alert-danger border-0 py-2 mb-2 text-center small" style={{ borderRadius: '8px', background: 'var(--danger-light)', color: 'var(--danger)' }} role="alert">
                      {error}
                    </div>
                  )}
                  
                  <button
                    className="btn-primary-custom w-100 fw-bold py-2"
                    onClick={onSubmit}
                    disabled={loading || !allAnswered}
                    style={{ borderRadius: '10px' }}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    ) : (
                      'Submit Assessment'
                    )}
                  </button>
                </div>
              </div>

              {/* Main Question Area */}
              <div className="col-md-8 col-lg-9 ps-md-4">
                <QuestionCard
                  question={exam.questions[currentQuestionIndex]}
                  idx={currentQuestionIndex}
                  answers={answers}
                  submitted={submitted}
                  onSelectAnswer={onSelectAnswer}
                />

                {/* Next / Previous Controls */}
                <div className="d-flex gap-3 mt-4">
                  <button
                    className="btn btn-primary px-4 py-2 fw-bold flex-grow-1"
                    style={{ borderRadius: '10px', fontSize: '1.1rem' }}
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
                  >
                    ← Previous
                  </button>
                  <button
                    className="btn btn-primary px-4 py-2 fw-bold flex-grow-1"
                    style={{ borderRadius: '10px', fontSize: '1.1rem' }}
                    disabled={currentQuestionIndex === exam.questions.length - 1}
                    onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                  >
                    Next →
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Renders the final grades percentage summaries and correct highlights */
            <div className="row justify-content-center">
              <div className="col-lg-8 col-md-10">
                <div className="p-5 text-center rounded-4 shadow" style={{ background: 'linear-gradient(135deg, var(--secondary) 0%, var(--primary) 100%)', color: '#fff' }}>
                  <h2 className="fw-bold mb-2 text-white" style={{ fontFamily: 'var(--heading)' }}>Assessment Completed!</h2>
                  <p className="mb-4 opacity-75" style={{ fontSize: '15px' }}>Great job completing the {exam.title} exam.</p>
                  
                  {exam.resultsReleased ? (
                    <>
                      <div className="display-2 fw-bold mb-2 text-white">
                        {score} <span className="fs-3 opacity-70">/ {exam.questions.length}</span>
                      </div>
                      <p className="h4 mb-4 text-white" style={{ opacity: 0.9 }}>Your Grade: {scorePercentage}%</p>
                    </>
                  ) : (
                    <div className="py-4">
                      <p className="h5 mb-2 text-white" style={{ opacity: 0.9 }}>Your answers have been submitted.</p>
                      <p className="mb-0 text-white opacity-75">Your final grade will be available here once the teacher publishes the results.</p>
                    </div>
                  )}

                  <div className="d-flex justify-content-center gap-3 mt-4">
                    <button className="btn btn-light rounded-pill px-4 py-2 fw-bold" onClick={onExit} style={{ border: 'none', color: 'var(--primary)', transition: 'all 0.2s' }}>
                      Back to Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExamTakingView;

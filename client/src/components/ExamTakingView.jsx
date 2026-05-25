import QuestionCard from './QuestionCard';

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
  const score = exam.questions.reduce(
    (acc, q) => acc + (answers[q.id] === q.correctAnswer ? 1 : 0),
    0
  );

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
      <div className="card exam-card shadow-lg mb-5">
        <div className="card-header bg-white border-bottom py-4 px-4 d-flex justify-content-between align-items-center">
          <div>
            <span className="badge bg-primary-subtle text-primary rounded-pill mb-2 px-3 py-2">
              Active Assessment
            </span>
            <h3 className="card-title fw-bold mb-0">{exam.title}</h3>
            <p className="text-muted small mb-0 mt-1">
              <span className="me-3">📅 {today}</span>
              <span>❓ {exam.questions.length} Questions</span>
            </p>
          </div>
          {submitted && (
            <div className="text-end">
              <div className="h4 fw-bold mb-0 text-primary">{scorePercentage}%</div>
              <div className="small text-muted">Final Grade</div>
            </div>
          )}
        </div>

        <div className="card-body bg-light py-4 px-4">
          <div className="row justify-content-center">
            <div className="col-lg-10">
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
                    {score} <small className="h4 opacity-75">/ {exam.questions.length}</small>
                  </div>
                  <p className="h5 mb-4">You scored {scorePercentage}%</p>
                  <div className="d-flex justify-content-center gap-3 mt-4">
                    <button className="btn btn-light rounded-pill px-4" onClick={onExit}>
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

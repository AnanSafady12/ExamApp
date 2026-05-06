import { useState } from 'react';
import { getExamById } from './api/examService';

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

    if (!result) {
      setError(`No exam found with ID "${examId}".`);
    } else {
      setExam(result);
    }

    setLoading(false);
  };

  const handleSelectAnswer = (questionId, option) => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  // Calculate score after submission
  const getScore = () => {
    if (!exam) return 0;
    return exam.questions.reduce(
      (acc, q) => acc + (answers[q.id] === q.correctAnswer ? 1 : 0),
      0,
    );
  };

  return (
    <div>
      <h2 className="mb-4">🎓 Student Portal</h2>

      {/* ── Search bar ────────────────────────────────── */}
      <div className="input-group mb-4" style={{ maxWidth: 420 }}>
        <input
          type="text"
          className="form-control"
          placeholder="Enter Exam ID to Start"
          value={examId}
          onChange={(e) => setExamId(e.target.value)}
        />
        <button className="btn btn-primary" onClick={handleFetchExam} disabled={loading}>
          {loading ? 'Loading…' : 'Start Exam'}
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* ── Exam questions ────────────────────────────── */}
      {exam && (
        <div className="card shadow-sm">
          <div className="card-header bg-success text-white">
            <strong>{exam.title}</strong>
          </div>
          <div className="card-body">
            {exam.questions.map((q, idx) => (
              <div key={q.id} className="mb-4">
                <p className="fw-bold">
                  {idx + 1}. {q.text}
                </p>
                <div className="d-flex flex-wrap gap-2">
                  {q.options.map((opt) => {
                    let variant = 'outline-secondary';
                    if (submitted) {
                      if (opt === q.correctAnswer) variant = 'success';
                      else if (answers[q.id] === opt && opt !== q.correctAnswer)
                        variant = 'danger';
                    } else if (answers[q.id] === opt) {
                      variant = 'primary';
                    }

                    return (
                      <button
                        key={opt}
                        className={`btn btn-${variant}`}
                        disabled={submitted}
                        onClick={() => handleSelectAnswer(q.id, opt)}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {!submitted ? (
              <button className="btn btn-primary" onClick={handleSubmit}>
                Submit Answers
              </button>
            ) : (
              <div className="alert alert-info mt-3 mb-0">
                <strong>
                  Your Score: {getScore()} / {exam.questions.length}
                </strong>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentPortal;

import { useState } from 'react';

// Renders a data table representing student scores for a chosen exam, shown on the Teacher Dashboard
function ScoreTable({ selectedExamScores, scoresLoading, onClose, activeExam, onPublishResults }) {
  const [reviewSubmission, setReviewSubmission] = useState(null);

  // Hide the table entirely if no exam has been selected and no load is active
  if (!selectedExamScores && !scoresLoading) return null;

  const isPublished = activeExam?.resultsReleased;

  return (
    <div className="card-premium mt-4" style={{ padding: '24px' }}>
      
      {/* Table header containing the selected exam details and close buttons */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold mb-0" style={{ color: 'var(--text-h)', fontSize: '1.4rem' }}>
          Scores for Exam: {activeExam?.title || `Exam #${selectedExamScores?.examId}`}
        </h3>
        <div className="d-flex align-items-center gap-3">
          {activeExam && (
            isPublished ? (
              <span className="badge bg-success px-3 py-2 rounded-pill small">
                Results Published
              </span>
            ) : (
              <button
                className="btn btn-outline-success btn-sm rounded-pill px-3 py-1.5 fw-bold"
                onClick={() => onPublishResults(activeExam.id)}
              >
                📢 Publish Results
              </button>
            )
          )}
          <button
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
            style={{ transition: 'all 0.2s' }}
          />
        </div>
      </div>

      <div className="mt-2">
        {/* Render a simple spinner overlay while fetching the scores from API */}
        {scoresLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm" role="status" style={{ color: 'var(--primary)' }} />
            <span className="ms-2 small text-muted">Fetching student scores…</span>
          </div>
        ) : selectedExamScores?.scores.length === 0 ? (
          /* Displays clean warning if no students have taken the selected exam yet */
          <p className="text-muted text-center py-4 mb-0 small" style={{ fontSize: '14px' }}>
            No scores recorded for this exam yet.
          </p>
        ) : (
          /* Responsive table displaying the scores in grades percentage columns */
          <div className="table-responsive">
            <table className="table table-premium align-middle mb-0 w-100">
              <thead>
                <tr>
                  <th className="py-2 px-3">Student Name</th>
                  <th className="py-2 px-3 text-center">Grade Score</th>
                  <th className="py-2 px-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {selectedExamScores?.scores.map((s, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 fw-bold" style={{ color: 'var(--text-h)', fontSize: '15px' }}>
                      {s.studentName}
                    </td>
                    <td className="py-3 px-3 text-center fw-bold" style={{ color: s.score >= (activeExam?.passingGrade || 60) ? 'var(--success)' : 'var(--danger)', fontSize: '15px' }}>
                      {s.score}%
                    </td>
                    <td className="py-3 px-3 text-end">
                      <button
                        className="btn btn-primary btn-sm rounded-pill px-3 py-1 fw-bold"
                        onClick={() => setReviewSubmission(s)}
                      >
                        🔍 Review Answers
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Submission Modal overlay */}
      {reviewSubmission && activeExam && (
        <div className="modal-overlay d-flex align-items-center justify-content-center" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1050,
          padding: '20px'
        }}>
          <div className="card-premium w-100 animate-in" style={{
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            border: 'none',
            borderRadius: '16px',
            background: 'var(--bg)'
          }}>
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
              <div>
                <h4 className="fw-bold mb-1">Review Submission</h4>
                <p className="text-muted small mb-0">
                  Student: <strong>{reviewSubmission.studentName}</strong> | Score: <strong>{reviewSubmission.score}%</strong>
                </p>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setReviewSubmission(null)}
                aria-label="Close"
              />
            </div>

            <div className="d-flex flex-column gap-3">
              {activeExam.questions.map((q, idx) => {
                const studentAns = reviewSubmission.answers[q.id] || '';
                const correctAns = q.correctAnswer || '';
                
                const isCorrect = q.type === 'SHORT_ANSWER'
                  ? studentAns.trim().toLowerCase() === correctAns.trim().toLowerCase()
                  : studentAns === correctAns;

                return (
                  <div key={q.id} className="p-3 border rounded-3 bg-light">
                    <p className="fw-bold mb-2">Q{idx + 1}: {q.text}</p>
                    <div className="small">
                      <p className={`mb-1 ${isCorrect ? 'text-success' : 'text-danger'}`}>
                        <strong>Student's Answer:</strong> {studentAns || '(No answer provided)'} {isCorrect ? '✓' : '✕'}
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

            <div className="mt-4 text-end">
              <button
                className="btn btn-secondary rounded-pill px-4 fw-bold"
                onClick={() => setReviewSubmission(null)}
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ScoreTable;

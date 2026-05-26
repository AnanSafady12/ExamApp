// Renders a data table representing student scores for a chosen exam, shown on the Teacher Dashboard
function ScoreTable({ selectedExamScores, scoresLoading, onClose }) {
  // Hide the table entirely if no exam has been selected and no load is active
  if (!selectedExamScores && !scoresLoading) return null;

  return (
    <div className="card-premium mt-4" style={{ padding: '24px' }}>
      
      {/* Table header containing the selected exam details and close buttons */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold mb-0" style={{ color: 'var(--text-h)', fontSize: '1.4rem' }}>
          Scores for Exam #{selectedExamScores?.examId}
        </h3>
        <button
          className="btn-close"
          onClick={onClose}
          aria-label="Close"
          style={{ transition: 'all 0.2s' }}
        />
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
          <p className="text-muted text-center py-4 mb-0 small" style={{ fontSize: '14px' }}>No scores recorded for this exam yet.</p>
        ) : (
          /* Responsive table displaying the scores in grades percentage columns */
          <div className="table-responsive">
            <table className="table table-premium align-middle mb-0 w-100">
              <thead>
                <tr>
                  <th className="py-2 px-3">Student Name</th>
                  <th className="py-2 px-3 text-end">Grade Score</th>
                </tr>
              </thead>
              <tbody>
                {selectedExamScores?.scores.map((s, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-3 fw-bold" style={{ color: 'var(--text-h)', fontSize: '15px' }}>{s.studentName}</td>
                    <td className="py-3 px-3 text-end fw-bold" style={{ color: s.score >= 60 ? 'var(--success)' : 'var(--danger)', fontSize: '15px' }}>{s.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default ScoreTable;

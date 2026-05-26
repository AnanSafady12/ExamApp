// Renders a data table representing student scores for a chosen exam, shown on the Teacher Dashboard
function ScoreTable({ selectedExamScores, scoresLoading, onClose }) {
  // Hide the table entirely if no exam has been selected and no load is active
  if (!selectedExamScores && !scoresLoading) return null;

  return (
    <div className="card mt-4 border-0 shadow-sm" style={{ borderRadius: '16px' }}>
      
      {/* Table header containing the selected exam details and close buttons */}
      <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center py-3 px-4" style={{ borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
        <h5 className="fw-bold mb-0">
          Scores for Exam #{selectedExamScores?.examId}
        </h5>
        <button
          className="btn-close btn-close-white"
          onClick={onClose}
          aria-label="Close"
        />
      </div>

      <div className="card-body p-4">
        {/* Render a simple spinner overlay while fetching the scores from API */}
        {scoresLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm text-secondary" role="status" />
            <span className="ms-2 small text-muted">Fetching student scores…</span>
          </div>
        ) : selectedExamScores?.scores.length === 0 ? (
          /* Displays clean warning if no students have taken the selected exam yet */
          <p className="text-muted text-center py-3 mb-0 small">No scores recorded for this exam yet.</p>
        ) : (
          /* Responsive table displaying the scores in grades percentage columns */
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="fw-semibold text-muted py-3 px-4">Student</th>
                  <th className="fw-semibold text-muted py-3 px-4 text-end">Score</th>
                </tr>
              </thead>
              <tbody>
                {selectedExamScores?.scores.map((s, idx) => (
                  <tr key={idx}>
                    <td className="py-3 px-4 fw-semibold text-dark">{s.studentName}</td>
                    <td className="py-3 px-4 text-end fw-bold text-primary">{s.score}</td>
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

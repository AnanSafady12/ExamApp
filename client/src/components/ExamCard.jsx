function ExamCard({ exam, onViewScores, onEdit, onDelete }) {
  return (
    <div className="card h-100 shadow-sm border-0" style={{ borderRadius: '16px' }}>
      <div className="card-body d-flex flex-column p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <h5 className="card-title fw-bold text-dark mb-0">{exam.title}</h5>
          <span className={`badge ${exam.status === 'published' ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'} rounded-pill px-3 py-2 small`}>
            {exam.status}
          </span>
        </div>
        <p className="card-text text-muted mb-4 small">
          📋 {exam.questions.length} question{exam.questions.length !== 1 && 's'}
        </p>
        <div className="d-flex flex-column gap-2 mt-auto">
          <button
            className="btn btn-outline-primary btn-sm w-100 py-2 fw-semibold"
            onClick={() => onViewScores(exam.id)}
            style={{ borderRadius: '10px' }}
          >
            View Scores
          </button>
          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-warning btn-sm flex-grow-1 py-2 fw-semibold"
              onClick={() => onEdit(exam)}
              style={{ borderRadius: '10px' }}
            >
              ✏️ Edit
            </button>
            <button
              className="btn btn-outline-danger btn-sm flex-grow-1 py-2 fw-semibold"
              onClick={() => onDelete(exam)}
              style={{ borderRadius: '10px' }}
            >
              🗑️ Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExamCard;

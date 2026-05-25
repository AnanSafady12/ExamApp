function ExamCard({ exam, onViewScores }) {
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
        <button
          className="btn btn-outline-primary btn-sm w-100 py-2 fw-semibold mt-auto"
          onClick={() => onViewScores(exam.id)}
          style={{ borderRadius: '10px' }}
        >
          View Scores
        </button>
      </div>
    </div>
  );
}

export default ExamCard;

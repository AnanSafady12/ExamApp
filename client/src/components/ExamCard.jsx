// Renders a card displaying exam title, questions count, status toggles, and CRUD buttons for teachers
function ExamCard({ exam, onViewScores, onEdit, onDelete, onStatusChange }) {
  return (
    <div className="card-premium h-100 d-flex flex-column" style={{ padding: '24px' }}>
      
      {/* Header containing the exam title and its status dropdown */}
      <div className="d-flex justify-content-between align-items-start mb-2">
        <h4 className="fw-bold mb-0" style={{ color: 'var(--text-h)', fontSize: '1.2rem', textWrap: 'balance' }}>
          {exam.title}
        </h4>
        
        {/* Dropdown menu to change exam status dynamically (draft, published, closed) */}
        <select
          className={`form-select form-select-sm fw-bold w-auto px-2 py-1 badge-role ${
            exam.status === 'published'
              ? 'badge-published'
              : exam.status === 'closed'
              ? 'badge-closed'
              : 'badge-draft'
          }`}
          value={exam.status}
          onChange={(e) => onStatusChange(exam.id, e.target.value)}
          style={{ fontSize: '11px', border: '1px solid transparent', outline: 'none', cursor: 'pointer' }}
        >
          <option value="draft">draft</option>
          <option value="published">published</option>
          <option value="closed">closed</option>
        </select>
      </div>

      {/* Displays the total count of questions in the exam */}
      <p className="text-muted mb-4 small" style={{ fontSize: '13px' }}>
        📋 {exam.questions.length} question{exam.questions.length !== 1 && 's'}
      </p>

      {/* Interaction buttons for viewing scores, editing, or deleting */}
      <div className="d-flex flex-column gap-2 mt-auto">
        <button
          className="btn btn-outline-primary btn-sm w-100 py-2 fw-bold"
          onClick={() => onViewScores(exam.id)}
          style={{ borderRadius: '10px', color: 'var(--primary)', borderColor: 'var(--primary-border)', background: 'var(--primary-light)', fontSize: '13px', transition: 'all 0.2s' }}
        >
          🔍 View Scores
        </button>
        
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-warning btn-sm flex-grow-1 py-2 fw-semibold"
            onClick={() => onEdit(exam)}
            style={{ borderRadius: '10px', color: 'var(--warning)', borderColor: 'var(--warning-border)', background: 'var(--warning-light)', fontSize: '13px', transition: 'all 0.2s' }}
          >
            ✏️ Edit
          </button>
          <button
            className="btn btn-outline-danger btn-sm flex-grow-1 py-2 fw-semibold"
            onClick={() => onDelete(exam)}
            style={{ borderRadius: '10px', color: 'var(--danger)', borderColor: 'var(--danger-border)', background: 'var(--danger-light)', fontSize: '13px', transition: 'all 0.2s' }}
          >
            🗑️ Delete
          </button>
        </div>
      </div>

    </div>
  );
}

export default ExamCard;

// Renders a warning confirmation card to prevent accidental exam deletions on the Teacher Dashboard
function DeleteExamModal({ exam, onConfirm, onCancel }) {
  // If no exam is queued for deletion, render nothing
  if (!exam) return null;

  return (
    <div className="card-premium mb-4" style={{ padding: '24px', borderColor: 'var(--danger-border)', borderLeft: '5px solid var(--danger)', background: 'var(--danger-light)' }}>
      <h4 className="fw-bold mb-3" style={{ color: 'var(--danger)', fontSize: '1.3rem' }}>
        ⚠️ Permanent Assessment Deletion
      </h4>
      <p className="mb-4" style={{ color: 'var(--text-h)', fontSize: '15px' }}>
        Are you sure you want to delete <strong>"{exam.title}"</strong>? This will wipe out all question parameters and student scores recorded for this assessment. <strong>This action cannot be undone.</strong>
      </p>

      {/* Action triggers to confirm or cancel the permanent deletion */}
      <div className="d-flex gap-3">
        <button
          className="btn btn-danger flex-grow-1 py-2 fw-bold"
          onClick={() => onConfirm(exam.id)}
          style={{ borderRadius: '10px', background: 'var(--danger)', border: 'none', transition: 'all 0.2s' }}
        >
          Delete Exam
        </button>
        <button
          className="btn btn-outline-secondary py-2 fw-semibold px-4"
          onClick={onCancel}
          style={{ borderRadius: '10px', border: '1.5px solid var(--border)', color: 'var(--text)', background: 'var(--bg-card)' }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default DeleteExamModal;

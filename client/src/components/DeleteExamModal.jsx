// Renders a warning confirmation card to prevent accidental exam deletions on the Teacher Dashboard
function DeleteExamModal({ exam, onConfirm, onCancel }) {
  // If no exam is queued for deletion, render nothing
  if (!exam) return null;

  return (
    <div className="card border-0 shadow-sm mb-4 border-danger" style={{ borderRadius: '16px', borderLeft: '4px solid #dc3545' }}>
      <div className="card-body p-4">
        <h5 className="fw-bold text-danger mb-3">🗑️ Delete Exam</h5>
        <p className="mb-4">
          Are you sure you want to delete <strong>"{exam.title}"</strong>?
          This action cannot be undone.
        </p>

        {/* Action triggers to confirm or cancel the permanent deletion */}
        <div className="d-flex gap-3">
          <button
            className="btn btn-danger flex-grow-1 py-2 fw-semibold"
            onClick={() => onConfirm(exam.id)}
            style={{ borderRadius: '10px' }}
          >
            Delete Exam
          </button>
          <button
            className="btn btn-outline-secondary py-2 fw-semibold px-4"
            onClick={onCancel}
            style={{ borderRadius: '10px' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteExamModal;

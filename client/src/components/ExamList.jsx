import notificationService from '../services/NotificationService';

// Renders a sleek table list containing individual exams and their management actions for teachers
function ExamList({ exams, onViewScores, onEdit, onDelete, onStatusChange, onLiveMonitor, onExportCSV, unreadCounts }) {
  // If the exams list is empty, display a clean fallback placeholder card
  if (exams.length === 0) {
    return (
      <div className="card-premium text-center py-5">
        <span style={{ fontSize: '3rem' }}>📭</span>
        <h4 className="fw-bold mt-3" style={{ color: 'var(--text-h)' }}>No exams available</h4>
        <p className="text-muted small">Create a new assessment to get started.</p>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="table table-premium align-middle mb-0">
        <thead>
          <tr>
            <th className="px-4 py-3" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Exam Name</th>
            <th className="px-4 py-3" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Questions</th>
            <th className="px-4 py-3" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
            <th className="px-4 py-3 text-end" style={{ fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em', paddingRight: '24px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {exams.map((exam) => {
            const unreadCount = unreadCounts?.[exam.id] || 0;
            return (
              <tr key={exam.id}>
                <td className="px-4 py-3 fw-bold" style={{ color: 'var(--text-h)', fontSize: '0.95rem' }}>
                  {exam.title}
                </td>
                <td className="px-4 py-3 text-muted" style={{ fontSize: '0.9rem' }}>
                  📋 {exam.questions.length} question{exam.questions.length !== 1 && 's'}
                </td>
                <td className="px-4 py-3">
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
                </td>
                <td className="px-4 py-3 text-end" style={{ paddingRight: '24px' }}>
                  <div className="d-flex justify-content-end align-items-center gap-2">
                    {exam.status === 'published' && (
                      <button
                        className="btn btn-primary btn-sm px-3 py-1.5 position-relative d-flex align-items-center gap-1"
                        onClick={() => onLiveMonitor(exam)}
                        style={{ borderRadius: '8px', fontSize: '12px' }}
                        title="Monitor live chat support for this exam"
                      >
                        📡 Live Monitor Chat
                        {unreadCount > 0 && (
                          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-sm">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    )}
                    <button
                      className="btn btn-outline-secondary btn-sm px-2.5 py-1.5 d-flex align-items-center gap-1"
                      onClick={() => onViewScores(exam.id)}
                      style={{ borderRadius: '8px', fontSize: '12px' }}
                      title="View student scores"
                    >
                      🔍 View Scores
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-sm px-2.5 py-1.5 d-flex align-items-center gap-1"
                      onClick={() => onExportCSV(exam)}
                      style={{ borderRadius: '8px', fontSize: '12px' }}
                      title="Export scores to CSV"
                    >
                      ⬇️ Export CSV
                    </button>
                    <button
                      className="btn btn-outline-secondary btn-sm px-2.5 py-1.5 d-flex align-items-center gap-1"
                      onClick={() => onEdit(exam)}
                      style={{ borderRadius: '8px', fontSize: '12px' }}
                      title="Edit exam questions and settings"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="btn btn-outline-danger btn-sm px-2.5 py-1.5 d-flex align-items-center gap-1"
                      onClick={() => onDelete(exam)}
                      style={{ borderRadius: '8px', fontSize: '12px' }}
                      title="Delete this exam permanently"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ExamList;

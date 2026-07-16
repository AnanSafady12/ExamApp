import { useState } from 'react';

// Renders a card displaying exam title, questions count, status toggles, and CRUD buttons for teachers
function ExamCard({ exam, onViewScores, onEdit, onDelete, onStatusChange, onLiveMonitor, onExportCSV, unreadCount }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="card-premium h-100 d-flex flex-column position-relative" style={{ padding: '24px' }}>
      
      {/* Header containing the status badge, exam title and action dropdown */}
      <div className="d-flex justify-content-between align-items-start mb-2">
        <div className="flex-grow-1 pe-2">
          <div className="d-flex align-items-center gap-2 mb-2">
            <span className={`badge-role ${
              exam.status === 'published'
                ? 'badge-published'
                : exam.status === 'closed'
                ? 'badge-closed'
                : 'badge-draft'
            }`}>
              {exam.status}
            </span>
          </div>
          <h4 className="fw-bold mb-0" style={{ color: 'var(--text-h)', fontSize: '1.2rem', textWrap: 'balance' }}>
            {exam.title}
          </h4>
        </div>
        
        {/* Dropdown controls (Status select + actions menu button) */}
        <div className="d-flex align-items-center gap-2">
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

          {/* Menu Dots Toggle */}
          <div className="position-relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="btn btn-link text-muted p-1 border-0 rounded-circle d-flex align-items-center justify-content-center"
              style={{ textDecoration: 'none', fontSize: '1.25rem', width: '28px', height: '28px', backgroundColor: 'var(--primary-light)', color: 'var(--primary) !important' }}
              title="Actions"
            >
              ⋮
            </button>

            {menuOpen && (
              <>
                {/* Backdrop to close menu when clicking outside */}
                <div 
                  className="position-fixed top-0 start-0 w-100 h-100" 
                  style={{ zIndex: 999, cursor: 'default' }} 
                  onClick={() => setMenuOpen(false)} 
                />
                
                {/* Dropdown Options overlay */}
                <ul 
                  className="dropdown-menu show dropdown-menu-end shadow border-0 position-absolute end-0 mt-1" 
                  style={{ zIndex: 1000, minWidth: '160px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <li>
                    <button 
                      className="dropdown-item py-2 fw-semibold text-start d-flex align-items-center gap-2"
                      style={{ color: 'var(--text)' }}
                      onClick={() => { onViewScores(exam.id); setMenuOpen(false); }}
                    >
                      📊 View Scores
                    </button>
                  </li>
                  <li>
                    <button 
                      className="dropdown-item py-2 fw-semibold text-start d-flex align-items-center gap-2"
                      style={{ color: 'var(--text)' }}
                      onClick={() => { onExportCSV(exam); setMenuOpen(false); }}
                    >
                      ⬇️ Export CSV
                    </button>
                  </li>
                  <li>
                    <button 
                      className="dropdown-item py-2 fw-semibold text-start d-flex align-items-center gap-2"
                      style={{ color: 'var(--text)' }}
                      onClick={() => { onEdit(exam); setMenuOpen(false); }}
                    >
                      ✏️ Edit
                    </button>
                  </li>
                  <li><hr className="dropdown-divider" style={{ borderColor: 'var(--border)' }} /></li>
                  <li>
                    <button 
                      className="dropdown-item py-2 text-danger fw-semibold text-start d-flex align-items-center gap-2"
                      onClick={() => { onDelete(exam); setMenuOpen(false); }}
                    >
                      🗑️ Delete
                    </button>
                  </li>
                </ul>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Displays the total count of questions in the exam */}
      <p className="text-muted mb-4 small" style={{ fontSize: '13px' }}>
        📋 {exam.questions.length} question{exam.questions.length !== 1 && 's'}
      </p>

      {/* Primary single action button at bottom */}
      <div className="mt-auto">
        {exam.status === 'published' ? (
          <button
            className="btn btn-primary btn-sm w-100 py-2 fw-bold position-relative"
            onClick={() => onLiveMonitor(exam)}
            style={{ borderRadius: '10px', fontSize: '13px', transition: 'all 0.2s' }}
          >
            📡 Live Monitor Chat
            {unreadCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>
        ) : (
          <button
            className="btn btn-outline-secondary btn-sm w-100 py-2 fw-bold"
            onClick={() => onViewScores(exam.id)}
            style={{ borderRadius: '10px', fontSize: '13px', transition: 'all 0.2s' }}
          >
            📊 View Scores
          </button>
        )}
      </div>

    </div>
  );
}

export default ExamCard;

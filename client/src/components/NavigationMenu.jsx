import { Link, useNavigate } from 'react-router-dom';
import authService, { ROLES } from '../services/AuthService';

// Renders the global top navigation bar for logged-in users
function NavigationMenu({ user, onLogout }) {
  const navigate = useNavigate();

  // Handles clicking the logout button by cleaning state and redirecting
  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  // Hide the navbar entirely if the user is not logged in
  if (!user) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-custom navbar-light">
      <div className="container-fluid p-0">
        {/* Brand link to return back to home redirect path */}
        <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center" to="/" style={{ color: 'var(--text-h)', letterSpacing: '-0.02em' }}>
          <span className="me-2" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>📝</span>
          <span style={{ fontFamily: 'var(--heading)' }}>E-Test System</span>
        </Link>

        <div className="collapse navbar-collapse d-flex justify-content-between align-items-center">
          <ul className="navbar-nav me-auto mb-0 gap-2">
            {/* Show Teacher Dashboard only for users with TEACHER role */}
            {user.role === ROLES.TEACHER && (
              <li className="nav-item">
                <Link className="nav-link fw-semibold px-3 py-2 rounded-3 d-flex align-items-center gap-1" to="/teacher" style={{ color: 'var(--text)', transition: 'all 0.2s' }}>
                  👨‍🏫 Teacher Dashboard
                </Link>
              </li>
            )}
            {/* Show Student Portal only for users with STUDENT role */}
            {user.role === ROLES.STUDENT && (
              <li className="nav-item">
                <Link className="nav-link fw-semibold px-3 py-2 rounded-3 d-flex align-items-center gap-1" to="/student" style={{ color: 'var(--text)', transition: 'all 0.2s' }}>
                  🎓 Student Portal
                </Link>
              </li>
            )}
            {/* Services Sandbox test page link visible to all logged-in users */}
            <li className="nav-item">
              <Link className="nav-link fw-semibold px-3 py-2 rounded-3 d-flex align-items-center gap-1" to="/sandbox" style={{ color: 'var(--text)', transition: 'all 0.2s' }}>
                🛠️ Services Sandbox
              </Link>
            </li>
          </ul>

          {/* User profile badges and logout button */}
          <div className="d-flex align-items-center gap-3">
            <span className="fw-semibold text-h d-flex align-items-center gap-1" style={{ color: 'var(--text-h)', fontSize: '15px' }}>
              <span className="opacity-70" style={{ fontSize: '1.2rem' }}>👤</span> {user.fullName}
            </span>
            <span className={`badge-role ${user.role === ROLES.TEACHER ? 'badge-teacher' : 'badge-student'}`}>
              {user.role}
            </span>
            <button 
              className="btn btn-outline-danger px-3 py-2 fw-semibold border-0 rounded-3 d-flex align-items-center gap-1" 
              onClick={handleLogoutClick} 
              style={{ background: 'var(--danger-light)', color: 'var(--danger)', fontSize: '14px', transition: 'all 0.2s' }}
            >
              🚪 Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavigationMenu;

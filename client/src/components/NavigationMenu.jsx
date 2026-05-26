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
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm mb-4 px-4 py-3" style={{ borderRadius: '12px' }}>
      <div className="container-fluid p-0">
        {/* Brand link to return back to home redirect path */}
        <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center" to="/">
          <span className="me-2">📝</span> E-Test System
        </Link>

        <div className="collapse navbar-collapse d-flex justify-content-between align-items-center">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-2">
            {/* Show Teacher Dashboard only for users with TEACHER role */}
            {user.role === ROLES.TEACHER && (
              <li className="nav-item">
                <Link className="btn btn-light fw-semibold text-dark px-3 py-2" to="/teacher" style={{ borderRadius: '8px' }}>
                  👨‍🏫 Teacher Dashboard
                </Link>
              </li>
            )}
            {/* Show Student Portal only for users with STUDENT role */}
            {user.role === ROLES.STUDENT && (
              <li className="nav-item">
                <Link className="btn btn-light fw-semibold text-dark px-3 py-2" to="/student" style={{ borderRadius: '8px' }}>
                  🎓 Student Portal
                </Link>
              </li>
            )}
            {/* Services Sandbox test page link visible to all logged-in users */}
            <li className="nav-item">
              <Link className="btn btn-light fw-semibold text-dark px-3 py-2" to="/sandbox" style={{ borderRadius: '8px' }}>
                🛠️ Services Sandbox
              </Link>
            </li>
          </ul>

          {/* User profile badges and logout button */}
          <div className="d-flex align-items-center gap-3">
            <span className="badge bg-info fs-6 fw-normal px-3 py-2" style={{ borderRadius: '10px' }}>
              {user.fullName}
            </span>
            <span className={`badge fs-6 fw-normal px-3 py-2 ${user.role === ROLES.TEACHER ? 'bg-success' : 'bg-warning text-dark'}`} style={{ borderRadius: '10px' }}>
              {user.role}
            </span>
            <button className="btn btn-outline-danger btn-sm px-3 py-2 fw-semibold" onClick={handleLogoutClick} style={{ borderRadius: '8px' }}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default NavigationMenu;

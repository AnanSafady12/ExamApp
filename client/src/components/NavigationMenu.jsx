import { Link, useNavigate } from 'react-router-dom';
import authService, { ROLES } from '../services/AuthService';

function NavigationMenu({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogoutClick = () => {
    onLogout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm mb-4 px-4 py-3" style={{ borderRadius: '12px' }}>
      <div className="container-fluid p-0">
        <Link className="navbar-brand fw-bold fs-4 d-flex align-items-center" to="/">
          <span className="me-2">📝</span> E-Test System
        </Link>

        <div className="collapse navbar-collapse d-flex justify-content-between align-items-center">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0 gap-2">
            {user.role === ROLES.TEACHER && (
              <li className="nav-item">
                <Link className="btn btn-light fw-semibold text-dark px-3 py-2" to="/teacher" style={{ borderRadius: '8px' }}>
                  👨‍🏫 Teacher Dashboard
                </Link>
              </li>
            )}
            {user.role === ROLES.STUDENT && (
              <li className="nav-item">
                <Link className="btn btn-light fw-semibold text-dark px-3 py-2" to="/student" style={{ borderRadius: '8px' }}>
                  🎓 Student Portal
                </Link>
              </li>
            )}
            <li className="nav-item">
              <Link className="btn btn-light fw-semibold text-dark px-3 py-2" to="/sandbox" style={{ borderRadius: '8px' }}>
                🛠️ Services Sandbox
              </Link>
            </li>
          </ul>

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

import { useState } from 'react';
import authService, { ROLES } from './services/AuthService';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import TeacherDashboard from './TeacherDashboard';
import StudentPortal from './StudentPortal';

function App() {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [authPage, setAuthPage] = useState('login');

  const handleLogin = async (username, password) => {
    const loggedInUser = await authService.login(username, password);
    setUser(loggedInUser);
  };

  const handleRegister = async (userData) => {
    const newUser = await authService.register(userData);
    setUser(newUser);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setAuthPage('login');
  };

  if (!user) {
    if (authPage === 'register') {
      return (
        <RegisterPage
          onRegister={handleRegister}
          onSwitchToLogin={() => setAuthPage('login')}
        />
      );
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onSwitchToRegister={() => setAuthPage('register')}
      />
    );
  }

  return (
    <div className="container py-4">
      <nav className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">📝 E-Test System</h1>
        <div className="d-flex align-items-center gap-3">
          <span className="badge bg-info fs-6 fw-normal px-3 py-2" style={{ borderRadius: '10px' }}>
            {user.fullName}
          </span>
          <span className={`badge fs-6 fw-normal px-3 py-2 ${user.role === ROLES.TEACHER ? 'bg-success' : 'bg-warning text-dark'}`} style={{ borderRadius: '10px' }}>
            {user.role}
          </span>
          <button className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <hr />

      {user.role === ROLES.TEACHER ? <TeacherDashboard /> : <StudentPortal />}
    </div>
  );
}

export default App;

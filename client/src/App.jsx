import { useState } from 'react';
import TeacherDashboard from './TeacherDashboard';
import StudentPortal from './StudentPortal';

function App() {
  // ── Login state ────────────────────────────────────
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState('');

  // ── Role toggle state ──────────────────────────────
  const [role, setRole] = useState('teacher'); // 'teacher' | 'student'

  const isTeacher = role === 'teacher';

  // ── Login handler ──────────────────────────────────
  const handleLogin = () => {
    if (username.trim() !== '' && password.trim() !== '') {
      setMessage('Welcome Admin');
      setIsLoggedIn(true);
    } else {
      setMessage('Please fill all fields');
    }
  };

  // ── Login screen ───────────────────────────────────
  if (!isLoggedIn) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-5">
            <div className="card shadow">
              <div className="card-body">
                <h2 className="card-title text-center mb-4">📝 E-Test Login</h2>

                <div className="mb-3">
                  <label className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <button className="btn btn-primary w-100" onClick={handleLogin}>
                  Login
                </button>

                {message && (
                  <div className="alert alert-danger mt-3 mb-0 text-center">
                    {message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Main app (after login) ─────────────────────────
  return (
    <div className="container py-4">
      {/* ── Navbar / Role Toggle ──────────────────────── */}
      <nav className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">📝 E-Test System</h1>
        <div>
          <span className="badge bg-info me-3">{message}</span>
          <button
            className={`btn ${isTeacher ? 'btn-success' : 'btn-warning'}`}
            onClick={() => setRole(isTeacher ? 'student' : 'teacher')}
          >
            Switch to {isTeacher ? 'Student' : 'Teacher'} View
          </button>
        </div>
      </nav>

      <hr />

      {/* ── Conditional view ──────────────────────────── */}
      {isTeacher ? <TeacherDashboard /> : <StudentPortal />}
    </div>
  );
}

export default App;

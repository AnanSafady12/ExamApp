import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROLES } from '../api/userService';

// Renders the registration form for new student and teacher accounts
function RegisterPage({ onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState(ROLES.STUDENT);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form submit handler that triggers the registration service call
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onRegister({ username, password, fullName, role });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-5">
          <div className="card-premium">
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle shadow-sm mb-3" style={{ width: '70px', height: '70px', background: 'var(--primary-light)' }}>
                <span style={{ fontSize: '2rem' }}>✏️</span>
              </div>
              <h2 className="fw-bold mt-2 mb-1" style={{ color: 'var(--text-h)' }}>Get Started</h2>
              <p className="text-muted" style={{ fontSize: '14px' }}>Create an account to begin assessments</p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit}>
              <div className="form-floating-custom">
                <input
                  id="register-fullname"
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-floating-custom">
                <input
                  id="register-username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-floating-custom">
                <input
                  id="register-password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              {/* Dropdown selector to choose account role (Student/Teacher) */}
              <div className="form-floating-custom">
                <select
                  id="register-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value={ROLES.STUDENT}>🎓 Student Account</option>
                  <option value={ROLES.TEACHER}>👨‍🏫 Teacher Account</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn-primary-custom w-100 fw-semibold py-2 fs-5 mt-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                ) : null}
                {loading ? 'Creating Account...' : 'Register'}
              </button>
            </form>

            {/* Show error messages if registration fails */}
            {error && (
              <div className="alert alert-danger mt-3 mb-0 text-center border-0 py-2" style={{ borderRadius: '12px', background: 'var(--danger-light)', color: 'var(--danger)' }}>
                ⚠️ {error}
              </div>
            )}

            {/* Direct Link element to navigate back to the Login page */}
            <div className="text-center mt-4">
              <span className="text-muted" style={{ fontSize: '14px' }}>Already have an account? </span>
              <Link
                className="fw-bold text-decoration-none"
                to="/login"
                style={{ color: 'var(--primary)' }}
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

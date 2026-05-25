import { useState } from 'react';
import { ROLES } from '../api/userService';

function RegisterPage({ onRegister, onSwitchToLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState(ROLES.STUDENT);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
          <div className="card shadow" style={{ borderRadius: '16px', border: 'none' }}>
            <div className="card-body p-4">
              <div className="text-center mb-4">
                <span className="display-4">✏️</span>
                <h2 className="fw-bold mt-2">Create Account</h2>
                <p className="text-muted">Register for E-Test</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="register-fullname" className="form-label fw-semibold">Full Name</label>
                  <input
                    id="register-fullname"
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Enter full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    style={{ borderRadius: '12px' }}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="register-username" className="form-label fw-semibold">Username</label>
                  <input
                    id="register-username"
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ borderRadius: '12px' }}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="register-password" className="form-label fw-semibold">Password</label>
                  <input
                    id="register-password"
                    type="password"
                    className="form-control form-control-lg"
                    placeholder="Choose a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ borderRadius: '12px' }}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="register-role" className="form-label fw-semibold">Role</label>
                  <select
                    id="register-role"
                    className="form-select form-select-lg"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ borderRadius: '12px' }}
                  >
                    <option value={ROLES.STUDENT}>Student</option>
                    <option value={ROLES.TEACHER}>Teacher</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-success btn-lg w-100 fw-bold"
                  disabled={loading}
                  style={{ borderRadius: '12px' }}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                  ) : null}
                  {loading ? 'Creating account...' : 'Create Account'}
                </button>
              </form>

              {error && (
                <div className="alert alert-danger mt-3 mb-0 text-center" style={{ borderRadius: '12px' }}>
                  {error}
                </div>
              )}

              <div className="text-center mt-4">
                <span className="text-muted">Already have an account? </span>
                <button
                  className="btn btn-link p-0 fw-semibold"
                  onClick={onSwitchToLogin}
                >
                  Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

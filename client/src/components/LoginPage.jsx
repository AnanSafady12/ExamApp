import { useState } from 'react';

function LoginPage({ onLogin, onSwitchToRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(username, password);
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
                <span className="display-4">📝</span>
                <h2 className="fw-bold mt-2">E-Test Login</h2>
                <p className="text-muted">Sign in to your account</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="login-username" className="form-label fw-semibold">Username</label>
                  <input
                    id="login-username"
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={{ borderRadius: '12px' }}
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="login-password" className="form-label fw-semibold">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    className="form-control form-control-lg"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{ borderRadius: '12px' }}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 fw-bold"
                  disabled={loading}
                  style={{ borderRadius: '12px' }}
                >
                  {loading ? (
                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                  ) : null}
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
              </form>

              {error && (
                <div className="alert alert-danger mt-3 mb-0 text-center" style={{ borderRadius: '12px' }}>
                  {error}
                </div>
              )}

              <div className="text-center mt-4">
                <span className="text-muted">Don't have an account? </span>
                <button
                  className="btn btn-link p-0 fw-semibold"
                  onClick={onSwitchToRegister}
                >
                  Register
                </button>
              </div>

              <div className="mt-4 p-3 rounded-3" style={{ backgroundColor: '#f8f9fa' }}>
                <small className="text-muted d-block mb-1 fw-semibold">Demo Accounts:</small>
                <small className="text-muted d-block">Teacher: teacher1 / pass123</small>
                <small className="text-muted d-block">Student: student1 / pass123</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

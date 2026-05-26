import { useState } from 'react';
import { Link } from 'react-router-dom';

// Renders the login form for authenticating users
function LoginPage({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form submit handler that triggers the login service call
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
          <div className="card-premium">
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center bg-light rounded-circle shadow-sm mb-3" style={{ width: '70px', height: '70px', background: 'var(--primary-light)' }}>
                <span style={{ fontSize: '2rem' }}>📝</span>
              </div>
              <h2 className="fw-bold mt-2 mb-1" style={{ color: 'var(--text-h)' }}>Welcome Back</h2>
              <p className="text-muted" style={{ fontSize: '14px' }}>Sign in to continue your assessment</p>
            </div>

            {/* Login Credentials Form */}
            <form onSubmit={handleSubmit}>
              <div className="form-floating-custom">
                <input
                  id="login-username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-floating-custom">
                <input
                  id="login-password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn-primary-custom w-100 fw-semibold py-2 fs-5 mt-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                ) : null}
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </form>

            {/* Shows error messages when credentials checks fail */}
            {error && (
              <div className="alert alert-danger mt-3 mb-0 text-center border-0 py-2" style={{ borderRadius: '12px', background: 'var(--danger-light)', color: 'var(--danger)' }}>
                ⚠️ {error}
              </div>
            )}

            {/* Direct Link element to load the Register form page */}
            <div className="text-center mt-4">
              <span className="text-muted" style={{ fontSize: '14px' }}>Don't have an account? </span>
              <Link
                className="fw-bold text-decoration-none"
                to="/register"
                style={{ color: 'var(--primary)' }}
              >
                Create Account
              </Link>
            </div>

            {/* Helpful section listing default credentials to assist testing */}
            <div className="mt-4 p-3 rounded-4 border-0" style={{ backgroundColor: 'var(--primary-light)', padding: '16px' }}>
              <small className="d-block mb-2 fw-bold text-uppercase" style={{ fontSize: '11px', letterSpacing: '0.05em', color: 'var(--primary)' }}>🛠️ Quick Test Accounts</small>
              <div className="d-flex justify-content-between mb-1" style={{ fontSize: '13px' }}>
                <span className="text-muted">👨‍🏫 Teacher:</span>
                <code style={{ color: 'var(--text-h)' }}>teacher1 / pass123</code>
              </div>
              <div className="d-flex justify-content-between" style={{ fontSize: '13px' }}>
                <span className="text-muted">🎓 Student:</span>
                <code style={{ color: 'var(--text-h)' }}>student1 / pass123</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

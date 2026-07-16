import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROLES, findUserByUsername } from '../api/userService';

// Renders the registration form for new student and teacher accounts
function RegisterPage({ onRegister }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState(ROLES.STUDENT);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Real-time username checking and password strength states
  const [usernameStatus, setUsernameStatus] = useState(''); // '', 'checking', 'available', 'taken'
  const [passwordStrength, setPasswordStrength] = useState(''); // '', 'weak', 'medium', 'strong'

  // Debounced effect for checking username availability
  useEffect(() => {
    if (!username.trim()) {
      setUsernameStatus('');
      return;
    }

    setUsernameStatus('checking');

    const checkAvailability = setTimeout(async () => {
      try {
        const existingUser = await findUserByUsername(username.trim());
        if (existingUser) {
          setUsernameStatus('taken');
        } else {
          setUsernameStatus('available');
        }
      } catch (err) {
        console.error('Error during username check:', err);
        setUsernameStatus('');
      }
    }, 400);

    return () => clearTimeout(checkAvailability);
  }, [username]);

  // Evaluates password complexity in real-time
  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);
    
    if (!val) {
      setPasswordStrength('');
      return;
    }
    
    let score = 0;
    if (val.length >= 6) score++;
    if (/[a-zA-Z]/.test(val) && /[0-9]/.test(val)) score++;
    if (/[^a-zA-Z0-9]/.test(val) && val.length >= 8) score++;

    if (score === 1 || val.length < 6) {
      setPasswordStrength('weak');
    } else if (score === 2) {
      setPasswordStrength('medium');
    } else if (score === 3) {
      setPasswordStrength('strong');
    }
  };

  // Form submit handler that triggers the registration service call
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (usernameStatus === 'taken') {
      setError('Username is already taken.');
      return;
    }

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
              <div className="d-inline-flex align-items-center justify-content-center shadow-sm mb-3" style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'var(--primary-light)' }}>
                <svg style={{ width: '28px', height: '28px', color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <h2 className="fw-bold mt-2 mb-1" style={{ color: 'var(--text-h)' }}>Get Started</h2>
              <p className="text-muted" style={{ fontSize: '14px' }}>Create an account to begin assessments</p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input
                  id="register-fullname"
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-3">
                <input
                  id="register-username"
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                
                {/* Username Availability Help Text */}
                {usernameStatus === 'checking' && (
                  <small className="text-muted d-block mt-1 ms-1">Checking availability...</small>
                )}
                {usernameStatus === 'available' && (
                  <small className="text-success d-block mt-1 ms-1">🟢 Username available</small>
                )}
                {usernameStatus === 'taken' && (
                  <small className="text-danger d-block mt-1 ms-1">🔴 Username already taken</small>
                )}
              </div>

              <div className="mb-3">
                <div className="password-wrapper">
                  <input
                    id="register-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={handlePasswordChange}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex="-1"
                  >
                    {showPassword ? (
                      <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Password Strength Meter Indicator */}
                {passwordStrength && (
                  <div className="strength-meter">
                    <div className={`strength-bar ${passwordStrength}`} />
                  </div>
                )}
                {passwordStrength && (
                  <small className="text-muted d-block mt-1 ms-1 text-capitalize">
                    Strength: <span className={`fw-bold text-${passwordStrength === 'weak' ? 'danger' : passwordStrength === 'medium' ? 'warning' : 'success'}`}>{passwordStrength}</span>
                  </small>
                )}
              </div>

              <div className="mb-3">
                <div className="password-wrapper">
                  <input
                    id="register-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="password-toggle-btn"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex="-1"
                  >
                    {showConfirmPassword ? (
                      <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>

                {confirmPassword && password !== confirmPassword && (
                  <small className="text-danger d-block mt-1 ms-1">⚠️ Passwords do not match</small>
                )}
              </div>

              {/* Dropdown selector to choose account role (Student/Teacher) */}
              <div className="mb-3">
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
                disabled={loading || (confirmPassword && password !== confirmPassword) || usernameStatus === 'taken'}
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

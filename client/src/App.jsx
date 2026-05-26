import { useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import authService, { ROLES } from './services/AuthService';
import LoginPage from './components/LoginPage';
import RegisterPage from './components/RegisterPage';
import TeacherDashboard from './TeacherDashboard';
import StudentPortal from './StudentPortal';
import SandboxPage from './components/SandboxPage';
import NavigationMenu from './components/NavigationMenu';
import ProtectedRoute from './components/ProtectedRoute';
import HomeRedirect from './components/HomeRedirect';

// The main App component that sets up client-side routing and login state
function App() {
  // Track active logged-in user from localStorage session
  const [user, setUser] = useState(authService.getCurrentUser());

  // Trigger login logic and update state to trigger re-renders
  const handleLogin = async (username, password) => {
    const loggedInUser = await authService.login(username, password);
    setUser(loggedInUser);
  };

  // Trigger account registration and log the new user in instantly
  const handleRegister = async (userData) => {
    const newUser = await authService.register(userData);
    setUser(newUser);
  };

  // Clear current active session and reset logged-in state
  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <HashRouter>
      <div className="container py-4">
        {/* Render global navigation header only if a user is logged in */}
        {user && <NavigationMenu user={user} onLogout={handleLogout} />}

        {/* Define routing configuration for the entire web app */}
        <Routes>
          {/* Renders root path which auto-redirects users based on role */}
          <Route path="/" element={<HomeRedirect />} />
          
          {/* Public login view. Reroutes to home if already authenticated */}
          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <LoginPage onLogin={handleLogin} onSwitchToRegister={() => {}} />
              )
            }
          />
          
          {/* Public register view. Reroutes to home if already authenticated */}
          <Route
            path="/register"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <RegisterPage onRegister={handleRegister} onSwitchToLogin={() => {}} />
              )
            }
          />

          {/* Secure route accessible only to authenticated Teachers */}
          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRole={ROLES.TEACHER}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />

          {/* Secure route accessible only to authenticated Students */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRole={ROLES.STUDENT}>
                <StudentPortal />
              </ProtectedRoute>
            }
          />

          {/* Secure sandbox view accessible to any logged-in user */}
          <Route
            path="/sandbox"
            element={
              <ProtectedRoute>
                <SandboxPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback route redirecting any unrecognized URL to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;

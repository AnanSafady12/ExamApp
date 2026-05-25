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

function App() {
  const [user, setUser] = useState(authService.getCurrentUser());

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
  };

  return (
    <HashRouter>
      <div className="container py-4">
        {user && <NavigationMenu user={user} onLogout={handleLogout} />}

        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          
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

          <Route
            path="/teacher"
            element={
              <ProtectedRoute allowedRole={ROLES.TEACHER}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRole={ROLES.STUDENT}>
                <StudentPortal />
              </ProtectedRoute>
            }
          />

          <Route
            path="/sandbox"
            element={
              <ProtectedRoute>
                <SandboxPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;

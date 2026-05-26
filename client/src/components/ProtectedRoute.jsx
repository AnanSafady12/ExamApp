import { Navigate } from 'react-router-dom';
import authService from '../services/AuthService';

// Wrapper component to protect pages based on login status and user role
function ProtectedRoute({ children, allowedRole }) {
  const user = authService.getCurrentUser();

  // If no user is logged in, send them to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If role does not match, redirect to their corresponding default page
  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'TEACHER' ? '/teacher' : '/student'} replace />;
  }

  return children;
}

export default ProtectedRoute;

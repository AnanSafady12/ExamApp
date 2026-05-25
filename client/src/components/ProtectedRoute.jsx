import { Navigate } from 'react-router-dom';
import authService from '../services/AuthService';

function ProtectedRoute({ children, allowedRole }) {
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    return <Navigate to={user.role === 'TEACHER' ? '/teacher' : '/student'} replace />;
  }

  return children;
}

export default ProtectedRoute;

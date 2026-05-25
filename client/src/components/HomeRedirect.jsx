import { Navigate } from 'react-router-dom';
import authService, { ROLES } from '../services/AuthService';

function HomeRedirect() {
  const user = authService.getCurrentUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === ROLES.TEACHER) {
    return <Navigate to="/teacher" replace />;
  }

  return <Navigate to="/student" replace />;
}

export default HomeRedirect;

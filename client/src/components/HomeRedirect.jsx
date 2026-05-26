import { Navigate } from 'react-router-dom';
import authService, { ROLES } from '../services/AuthService';

// HomeRedirect routes users arriving at the root URL (/) to their respective role dashboard
function HomeRedirect() {
  const user = authService.getCurrentUser();

  // Redirect to login page if no active user session exists
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect teachers to the teacher dashboard
  if (user.role === ROLES.TEACHER) {
    return <Navigate to="/teacher" replace />;
  }

  // Redirect students to the student portal
  return <Navigate to="/student" replace />;
}

export default HomeRedirect;

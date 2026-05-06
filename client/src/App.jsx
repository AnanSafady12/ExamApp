import { useState } from 'react';
import TeacherDashboard from './TeacherDashboard';
import StudentPortal from './StudentPortal';

function App() {
  const [role, setRole] = useState('teacher'); // 'teacher' | 'student'

  const isTeacher = role === 'teacher';

  return (
    <div className="container py-4">
      {/* ── Navbar / Role Toggle ──────────────────────── */}
      <nav className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">📝 E-Test System</h1>
        <button
          className={`btn ${isTeacher ? 'btn-success' : 'btn-warning'}`}
          onClick={() => setRole(isTeacher ? 'student' : 'teacher')}
        >
          Switch to {isTeacher ? 'Student' : 'Teacher'} View
        </button>
      </nav>

      <hr />

      {/* ── Conditional view ──────────────────────────── */}
      {isTeacher ? <TeacherDashboard /> : <StudentPortal />}
    </div>
  );
}

export default App;

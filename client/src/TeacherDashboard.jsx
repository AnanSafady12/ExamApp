import { useState, useEffect } from 'react';
import { getAllExams, getScoresByExam } from './api/examService';

function TeacherDashboard() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExamScores, setSelectedExamScores] = useState(null);
  const [scoresLoading, setScoresLoading] = useState(false);

  // Fetch all exams on mount
  useEffect(() => {
    getAllExams()
      .then((data) => setExams(data))
      .finally(() => setLoading(false));
  }, []);

  // Show scores for a specific exam
  const handleViewScores = async (examId) => {
    setScoresLoading(true);
    const scores = await getScoresByExam(examId);
    setSelectedExamScores({ examId, scores });
    setScoresLoading(false);
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading exams…</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">📋 Teacher Dashboard</h2>

      {/* ── Exam list ─────────────────────────────────── */}
      <div className="row">
        {exams.map((exam) => (
          <div className="col-md-4 mb-3" key={exam.id}>
            <div className="card h-100 shadow-sm">
              <div className="card-body d-flex flex-column">
                <h5 className="card-title">{exam.title}</h5>
                <p className="card-text text-muted">
                  {exam.questions.length} question{exam.questions.length !== 1 && 's'}
                </p>
                <button
                  className="btn btn-outline-primary mt-auto"
                  onClick={() => handleViewScores(exam.id)}
                >
                  View Scores
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Scores panel ──────────────────────────────── */}
      {scoresLoading && (
        <div className="text-center my-4">
          <div className="spinner-border spinner-border-sm text-secondary" role="status" />
          <span className="ms-2">Fetching scores…</span>
        </div>
      )}

      {selectedExamScores && !scoresLoading && (
        <div className="card mt-4 shadow-sm">
          <div className="card-header bg-primary text-white">
            Scores for Exam #{selectedExamScores.examId}
          </div>
          <div className="card-body">
            {selectedExamScores.scores.length === 0 ? (
              <p className="text-muted mb-0">No scores recorded yet.</p>
            ) : (
              <table className="table table-striped mb-0">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedExamScores.scores.map((s, idx) => (
                    <tr key={idx}>
                      <td>{s.studentName}</td>
                      <td>{s.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default TeacherDashboard;

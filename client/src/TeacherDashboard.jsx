import { useState, useEffect } from 'react';
import { getAllExams, getScoresByExam } from './api/examService';
import ExamList from './components/ExamList';
import ScoreTable from './components/ScoreTable';
import notificationService from './services/NotificationService';

function TeacherDashboard() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExamScores, setSelectedExamScores] = useState(null);
  const [scoresLoading, setScoresLoading] = useState(false);

  useEffect(() => {
    getAllExams()
      .then((data) => {
        setExams(data);
        notificationService.success('Exams retrieved successfully');
      })
      .catch((err) => {
        notificationService.error(`Failed to load exams: ${err.message}`);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleViewScores = async (examId) => {
    setScoresLoading(true);
    setSelectedExamScores({ examId, scores: [] });
    try {
      const scores = await getScoresByExam(examId);
      setSelectedExamScores({ examId, scores });
      notificationService.success(`Loaded scores for exam #${examId}`);
    } catch (err) {
      notificationService.error(`Failed to retrieve scores: ${err.message}`);
    } finally {
      setScoresLoading(false);
    }
  };

  const handleCloseScores = () => {
    setSelectedExamScores(null);
  };

  if (loading) {
    return (
      <div className="text-center my-5 py-5">
        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }} />
        <p className="mt-3 text-muted">Retrieving exams list…</p>
      </div>
    );
  }

  return (
    <div className="container p-0">
      <h2 className="fw-bold text-dark mb-4">📋 Teacher Dashboard</h2>

      <ExamList exams={exams} onViewScores={handleViewScores} />

      <ScoreTable
        selectedExamScores={selectedExamScores}
        scoresLoading={scoresLoading}
        onClose={handleCloseScores}
      />
    </div>
  );
}

export default TeacherDashboard;

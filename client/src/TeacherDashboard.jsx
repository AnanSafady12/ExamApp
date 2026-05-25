import { useState, useEffect } from 'react';
import { getAllExams, getScoresByExam, createExam, updateExam, deleteExam } from './api/examService';
import ExamList from './components/ExamList';
import ScoreTable from './components/ScoreTable';
import ExamForm from './components/ExamForm';
import DeleteExamModal from './components/DeleteExamModal';
import notificationService from './services/NotificationService';
import loggerService from './services/LoggerService';

function TeacherDashboard() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExamScores, setSelectedExamScores] = useState(null);
  const [scoresLoading, setScoresLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [deletingExam, setDeletingExam] = useState(null);

  const fetchExams = async () => {
    try {
      const data = await getAllExams();
      setExams(data);
      return data;
    } catch (err) {
      notificationService.error(`Failed to load exams: ${err.message}`);
      return [];
    }
  };

  useEffect(() => {
    fetchExams()
      .then(() => {
        notificationService.success('Exams retrieved successfully');
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

  const handleCreateClick = () => {
    setEditingExam(null);
    setShowForm(true);
    loggerService.info('Opened create exam form');
  };

  const handleEditClick = (exam) => {
    setEditingExam(exam);
    setShowForm(true);
    loggerService.info(`Opened edit form for exam: ${exam.title}`);
  };

  const handleDeleteClick = (exam) => {
    setDeletingExam(exam);
    loggerService.info(`Opened delete confirmation for exam: ${exam.title}`);
  };

  const handleFormSubmit = async (payload) => {
    try {
      if (editingExam) {
        await updateExam(editingExam.id, payload);
        notificationService.success(`Exam "${payload.title}" updated successfully`);
        loggerService.success(`Updated exam: ${payload.title}`);
      } else {
        await createExam(payload);
        notificationService.success(`Exam "${payload.title}" created successfully`);
        loggerService.success(`Created exam: ${payload.title}`);
      }
      setShowForm(false);
      setEditingExam(null);
      await fetchExams();
    } catch (err) {
      notificationService.error(`Failed to save exam: ${err.message}`);
      loggerService.error(`Failed to save exam: ${err.message}`);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingExam(null);
  };

  const handleStatusChange = async (examId, newStatus) => {
    try {
      await updateExam(examId, { status: newStatus });
      notificationService.success(`Exam status updated to ${newStatus}`);
      loggerService.success(`Updated exam ID ${examId} status to ${newStatus}`);
      await fetchExams();
    } catch (err) {
      notificationService.error(`Failed to update status: ${err.message}`);
      loggerService.error(`Failed to update status: ${err.message}`);
    }
  };

  const handleDeleteConfirm = async (examId) => {
    try {
      await deleteExam(examId);
      notificationService.success(`Exam deleted successfully`);
      loggerService.success(`Deleted exam ID: ${examId}`);
      setDeletingExam(null);
      await fetchExams();
    } catch (err) {
      notificationService.error(`Failed to delete exam: ${err.message}`);
      loggerService.error(`Failed to delete exam: ${err.message}`);
    }
  };

  const handleDeleteCancel = () => {
    setDeletingExam(null);
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-dark mb-0">📋 Teacher Dashboard</h2>
        {!showForm && (
          <button
            className="btn btn-primary fw-semibold px-4 py-2"
            onClick={handleCreateClick}
            style={{ borderRadius: '10px' }}
          >
            + Create New Exam
          </button>
        )}
      </div>

      {showForm && (
        <ExamForm
          exam={editingExam}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {deletingExam && (
        <DeleteExamModal
          exam={deletingExam}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}

      <ExamList
        exams={exams}
        onViewScores={handleViewScores}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onStatusChange={handleStatusChange}
      />

      <ScoreTable
        selectedExamScores={selectedExamScores}
        scoresLoading={scoresLoading}
        onClose={handleCloseScores}
      />
    </div>
  );
}

export default TeacherDashboard;

import { useState, useEffect } from 'react';
import { getAllExams, getScoresByExam, createExam, updateExam, deleteExam } from './api/examService';
import ExamList from './components/ExamList';
import ScoreTable from './components/ScoreTable';
import ExamForm from './components/ExamForm';
import DeleteExamModal from './components/DeleteExamModal';
import notificationService from './services/NotificationService';
import loggerService from './services/LoggerService';

// Renders the workspace for teachers to manage exams and view scores
function TeacherDashboard() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExamScores, setSelectedExamScores] = useState(null);
  const [scoresLoading, setScoresLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [deletingExam, setDeletingExam] = useState(null);

  // Fetch all exams from the mock API and update state
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

  // Pull exams list on dashboard mount
  useEffect(() => {
    fetchExams()
      .then(() => {
        notificationService.success('Exams retrieved successfully');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Fetch student score records for the selected exam
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

  // Clear student scores detailed overlay
  const handleCloseScores = () => {
    setSelectedExamScores(null);
  };

  // Switch UI to show create form
  const handleCreateClick = () => {
    setEditingExam(null);
    setShowForm(true);
    loggerService.info('Opened create exam form');
  };

  // Switch UI to show edit form with targeted values prefilled
  const handleEditClick = (exam) => {
    setEditingExam(exam);
    setShowForm(true);
    loggerService.info(`Opened edit form for exam: ${exam.title}`);
  };

  // Open safe delete confirmation modal for chosen exam
  const handleDeleteClick = (exam) => {
    setDeletingExam(exam);
    loggerService.info(`Opened delete confirmation for exam: ${exam.title}`);
  };

  // Handles adding new exams or updating edited ones upon form submission
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

  // Cancel form edit and return to main grid
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingExam(null);
  };

  // Update draft, published, or closed status of an exam card
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

  // Call mock DB service to permanently remove an exam
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

  // Close deletion confirmation overlay modal
  const handleDeleteCancel = () => {
    setDeletingExam(null);
  };

  // Show standard loading screen when loading list entries
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

      {/* Render creation and editing form element overlay */}
      {showForm && (
        <ExamForm
          exam={editingExam}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      )}

      {/* Render deletion warning confirmation popups */}
      {deletingExam && (
        <DeleteExamModal
          exam={deletingExam}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
        />
      )}

      {/* Grid displaying the list of all exam cards */}
      <ExamList
        exams={exams}
        onViewScores={handleViewScores}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onStatusChange={handleStatusChange}
      />

      {/* Table grid listing student test results summary */}
      <ScoreTable
        selectedExamScores={selectedExamScores}
        scoresLoading={scoresLoading}
        onClose={handleCloseScores}
      />
    </div>
  );
}

export default TeacherDashboard;

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import TeacherDashboard from '../TeacherDashboard';
import { getAllExams, getScoresByExam } from '../api/examService';
import notificationService from '../services/NotificationService';

vi.mock('../api/examService', () => {
  return {
    getAllExams: vi.fn(),
    getScoresByExam: vi.fn()
  };
});

vi.mock('../services/NotificationService', () => {
  return {
    default: {
      success: vi.fn(),
      error: vi.fn()
    }
  };
});

describe('TeacherDashboard Component tests', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should render loading state initially and then show list of exams', async () => {
    const mockExams = [
      { id: 1, title: 'JavaScript Fundamentals', status: 'published', questions: [{ id: 'q1' }] },
      { id: 2, title: 'React Essentials', status: 'draft', questions: [{ id: 'q2' }, { id: 'q3' }] }
    ];

    getAllExams.mockResolvedValue(mockExams);

    render(<TeacherDashboard />);

    expect(screen.getByText(/Retrieving exams list…/i)).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText('JavaScript Fundamentals')).toBeTruthy();
      expect(screen.getByText('React Essentials')).toBeTruthy();
    });

    expect(screen.getByText(/1 question/i)).toBeTruthy();
    expect(screen.getByText(/2 questions/i)).toBeTruthy();
    expect(notificationService.success).toHaveBeenCalledWith('Exams retrieved successfully');
  });

  it('should call getScoresByExam when View Scores is clicked and show scores table', async () => {
    const mockExams = [
      { id: 1, title: 'JavaScript Fundamentals', status: 'published', questions: [{ id: 'q1' }] }
    ];
    const mockScores = [
      { studentName: 'Alice Johnson', score: 85 }
    ];

    getAllExams.mockResolvedValue(mockExams);
    getScoresByExam.mockResolvedValue(mockScores);

    render(<TeacherDashboard />);

    await waitFor(() => {
      expect(screen.getByText('JavaScript Fundamentals')).toBeTruthy();
    });

    const viewButton = screen.getByRole('button', { name: /View Scores/i });
    fireEvent.click(viewButton);

    expect(screen.getByText(/Fetching student scores…/i)).toBeTruthy();

    await waitFor(() => {
      expect(screen.getByText('Alice Johnson')).toBeTruthy();
      expect(screen.getByText('85')).toBeTruthy();
    });

    expect(notificationService.success).toHaveBeenCalledWith('Loaded scores for exam #1');
  });

  it('should trigger notification error when fetching exams fails', async () => {
    getAllExams.mockRejectedValue(new Error('Network error'));

    render(<TeacherDashboard />);

    await waitFor(() => {
      expect(notificationService.error).toHaveBeenCalledWith('Failed to load exams: Network error');
    });
  });
});

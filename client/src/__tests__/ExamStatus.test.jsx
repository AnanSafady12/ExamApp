import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import TeacherDashboard from '../TeacherDashboard';
import StudentPortal from '../StudentPortal';
import { getAllExams, getExamById, updateExam } from '../api/examService';
import notificationService from '../services/NotificationService';
import loggerService from '../services/LoggerService';

vi.mock('../api/examService', () => {
  return {
    getAllExams: vi.fn(),
    getExamById: vi.fn(),
    updateExam: vi.fn(),
    getScoresByExam: vi.fn().mockResolvedValue([]),
    getStudentSubmissions: vi.fn().mockResolvedValue([]),
  };
});

vi.mock('../services/NotificationService', () => {
  return {
    default: {
      success: vi.fn(),
      error: vi.fn(),
    },
  };
});

vi.mock('../services/LoggerService', () => {
  return {
    default: {
      info: vi.fn(),
      success: vi.fn(),
      error: vi.fn(),
      warning: vi.fn(),
    },
  };
});

const mockExams = [
  {
    id: 1,
    title: 'JS Basics',
    status: 'draft',
    questions: [
      {
        id: 'q1',
        text: 'What is 1+1?',
        options: ['1', '2', '3', '4'],
        correctAnswer: '2',
      },
    ],
  },
  {
    id: 2,
    title: 'React Basics',
    status: 'published',
    questions: [
      {
        id: 'q1',
        text: 'What is a hook?',
        options: ['A', 'B', 'C', 'D'],
        correctAnswer: 'A',
      },
    ],
  },
];

describe('Exam Status Management', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('should allow teacher to change exam status', async () => {
    getAllExams.mockResolvedValue([...mockExams]);
    updateExam.mockResolvedValue({ ...mockExams[0], status: 'published' });

    render(<TeacherDashboard />);

    await waitFor(() => {
      expect(screen.getByText('JS Basics')).toBeTruthy();
    });

    const selectDropdowns = screen.getAllByRole('combobox');
    expect(selectDropdowns[0].value).toBe('draft');

    fireEvent.change(selectDropdowns[0], { target: { value: 'published' } });

    await waitFor(() => {
      expect(updateExam).toHaveBeenCalledWith(1, { status: 'published' });
    });

    await waitFor(() => {
      expect(notificationService.success).toHaveBeenCalledWith('Exam status updated to published');
    });

    expect(loggerService.success).toHaveBeenCalledWith('Updated exam ID 1 status to published');
  });

  it('should block student from seeing or starting draft and closed exams', async () => {
    getAllExams.mockResolvedValue([...mockExams]);

    render(<StudentPortal />);

    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeTruthy();
    });

    expect(screen.queryByText('JS Basics')).toBeNull();
  });

  it('should allow student to start published exams', async () => {
    getAllExams.mockResolvedValue([...mockExams]);

    render(<StudentPortal />);

    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeTruthy();
    });

    const startButton = screen.getByRole('button', { name: /Start Exam/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Active Assessment')).toBeTruthy();
    });
  });

  it('should block submission if exam becomes closed while student is taking it', async () => {
    let mockExamState = { ...mockExams[1] };
    getAllExams.mockResolvedValue([mockExamState]);
    getExamById.mockImplementation((id) => {
      return Promise.resolve(mockExamState);
    });

    render(<StudentPortal />);

    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeTruthy();
    });

    const startButton = screen.getByRole('button', { name: /Start Exam/i });
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Active Assessment')).toBeTruthy();
    });

    const optionBtn = screen.getByRole('button', { name: /^A$/ });
    fireEvent.click(optionBtn);

    mockExamState.status = 'closed';

    const submitBtn = screen.getByRole('button', { name: /Submit Assessment/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('This exam is closed and can no longer be submitted.')).toBeTruthy();
    });

    expect(notificationService.error).toHaveBeenCalledWith('Submission failed: Exam "React Basics" is closed.');
    expect(loggerService.error).toHaveBeenCalledWith('Failed submission attempt for closed exam ID 2');
  });
});

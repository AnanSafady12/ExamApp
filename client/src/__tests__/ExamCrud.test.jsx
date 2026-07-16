import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import TeacherDashboard from '../pages/TeacherDashboard';
import { getAllExams, createExam, updateExam, deleteExam } from '../api/examService';
import notificationService from '../services/NotificationService';

vi.mock('../api/examService', () => {
  return {
    getAllExams: vi.fn(),
    getScoresByExam: vi.fn(),
    createExam: vi.fn(),
    updateExam: vi.fn(),
    deleteExam: vi.fn(),
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
    title: 'Test Exam',
    status: 'published',
    questions: [
      {
        id: 'q1',
        text: 'What is 1+1?',
        options: ['1', '2', '3', '4'],
        correctAnswer: '2',
      },
    ],
  },
];

describe('Exam CRUD Operations', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
    getAllExams.mockResolvedValue([...mockExams]);
  });

  it('should call createExam with correct data when creating a new exam', async () => {
    createExam.mockResolvedValue({ id: 2, title: 'New Exam', status: 'draft', questions: [] });
    getAllExams
      .mockResolvedValueOnce([...mockExams])
      .mockResolvedValueOnce([...mockExams, { id: 2, title: 'New Exam', status: 'draft', questions: [] }]);

    render(<TeacherDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Test Exam')).toBeTruthy();
    });

    const createButton = screen.getByRole('button', { name: /Create New Exam/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Create New Exam/i, { selector: 'h4' })).toBeTruthy();
    });

    const titleInput = screen.getByPlaceholderText('Enter exam title...');
    fireEvent.change(titleInput, { target: { value: 'New Exam' } });

    const questionInput = screen.getByPlaceholderText('Question text...');
    fireEvent.change(questionInput, { target: { value: 'Sample question?' } });

    const optionInputs = screen.getAllByPlaceholderText(/Option \d/);
    fireEvent.change(optionInputs[0], { target: { value: 'A answer' } });
    fireEvent.change(optionInputs[1], { target: { value: 'B answer' } });
    fireEvent.change(optionInputs[2], { target: { value: 'C answer' } });
    fireEvent.change(optionInputs[3], { target: { value: 'D answer' } });

    const selectEl = screen.getByDisplayValue('Select correct answer...');
    fireEvent.change(selectEl, { target: { value: 'A answer' } });

    const submitButton = screen.getByRole('button', { name: /Create Exam/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createExam).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Exam',
        questions: [
          expect.objectContaining({
            text: 'Sample question?',
            options: ['A answer', 'B answer', 'C answer', 'D answer'],
            correctAnswer: 'A answer',
          }),
        ],
      }));
    });

    await waitFor(() => {
      expect(notificationService.success).toHaveBeenCalledWith('Exam "New Exam" created successfully');
    });

    await waitFor(() => {
      expect(screen.getByText('New Exam')).toBeTruthy();
    });
  });

  it('should call updateExam when editing an existing exam', async () => {
    updateExam.mockResolvedValue({ ...mockExams[0], title: 'Updated Exam' });
    getAllExams
      .mockResolvedValueOnce([...mockExams])
      .mockResolvedValueOnce([{ ...mockExams[0], title: 'Updated Exam' }]);

    render(<TeacherDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Test Exam')).toBeTruthy();
    });

    const editButton = screen.getByRole('button', { name: /Edit/i });
    fireEvent.click(editButton);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Test Exam')).toBeTruthy();
    });

    const titleInput = screen.getByDisplayValue('Test Exam');
    fireEvent.change(titleInput, { target: { value: 'Updated Exam' } });

    const submitButton = screen.getByRole('button', { name: /Save Changes/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(updateExam).toHaveBeenCalledWith(1, expect.objectContaining({
        title: 'Updated Exam',
      }));
    });

    await waitFor(() => {
      expect(notificationService.success).toHaveBeenCalledWith('Exam "Updated Exam" updated successfully');
    });

    await waitFor(() => {
      expect(screen.getByText('Updated Exam')).toBeTruthy();
    });
  });

  it('should call deleteExam when confirming deletion', async () => {
    deleteExam.mockResolvedValue(true);
    getAllExams
      .mockResolvedValueOnce([...mockExams])
      .mockResolvedValueOnce([]);

    render(<TeacherDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Test Exam')).toBeTruthy();
    });

    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByText(/Are you sure you want to delete/i)).toBeTruthy();
    });

    const confirmButton = screen.getByRole('button', { name: /Delete Exam/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(deleteExam).toHaveBeenCalledWith(1);
    });

    await waitFor(() => {
      expect(notificationService.success).toHaveBeenCalledWith('Exam deleted successfully');
    });

    await waitFor(() => {
      expect(screen.queryByText('Test Exam')).toBeNull();
    });
  });

  it('should prevent submission when title and question text are empty', async () => {
    render(<TeacherDashboard />);

    await waitFor(() => {
      expect(screen.getByText('Test Exam')).toBeTruthy();
    });

    const createButton = screen.getByRole('button', { name: /Create New Exam/i });
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Create New Exam/i, { selector: 'h4' })).toBeTruthy();
    });

    const submitButton = screen.getByRole('button', { name: /Create Exam/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Exam title is required')).toBeTruthy();
      expect(screen.getByText('Question 1 text is required')).toBeTruthy();
    });

    expect(createExam).not.toHaveBeenCalled();
  });
});


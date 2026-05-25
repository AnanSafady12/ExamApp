import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import StudentPortal from '../StudentPortal';
import StudentExamList from '../components/StudentExamList';
import QuestionCard from '../components/QuestionCard';
import ExamTakingView from '../components/ExamTakingView';
import { getAllExams } from '../api/examService';

vi.mock('../api/examService', () => {
  return {
    getAllExams: vi.fn(),
    getExamById: vi.fn(),
  };
});

const mockExams = [
  {
    id: 1,
    title: 'JS Basics',
    status: 'draft',
    questions: [],
  },
  {
    id: 2,
    title: 'React Basics',
    status: 'published',
    questions: [
      {
        id: 'q1',
        text: 'What is state?',
        options: ['Mutable', 'Read-only'],
        correctAnswer: 'Mutable',
      },
    ],
  },
];

describe('Student Exam List and Exam Taking', () => {
  beforeEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('Student page shows only published exams', async () => {
    getAllExams.mockResolvedValue([...mockExams]);
    render(<StudentPortal />);

    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeTruthy();
    });
    expect(screen.queryByText('JS Basics')).toBeNull();
  });

  it('Student can start an exam', async () => {
    getAllExams.mockResolvedValue([...mockExams]);
    render(<StudentPortal />);

    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeTruthy();
    });

    const startBtn = screen.getByRole('button', { name: /Start Exam/i });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(screen.getByText('Active Assessment')).toBeTruthy();
      expect(screen.getByText('What is state?')).toBeTruthy();
    });
  });

  it('Question options render correctly', () => {
    const question = {
      id: 'q1',
      text: 'What is state?',
      options: ['Option A', 'Option B'],
      correctAnswer: 'Option A',
    };

    render(
      <QuestionCard
        question={question}
        idx={0}
        answers={{}}
        submitted={false}
        onSelectAnswer={() => {}}
      />
    );

    expect(screen.getByText('What is state?')).toBeTruthy();
    expect(screen.getByText('Option A')).toBeTruthy();
    expect(screen.getByText('Option B')).toBeTruthy();
  });

  it('Submit is disabled until all questions answered', () => {
    const exam = {
      id: 2,
      title: 'React Basics',
      questions: [
        {
          id: 'q1',
          text: 'What is state?',
          options: ['Option A', 'Option B'],
          correctAnswer: 'Option A',
        },
      ],
    };

    const { rerender } = render(
      <ExamTakingView
        exam={exam}
        answers={{}}
        submitted={false}
        error=""
        loading={false}
        onSelectAnswer={() => {}}
        onSubmit={() => {}}
        onExit={() => {}}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /Submit Assessment/i });
    expect(submitBtn.disabled).toBe(true);

    rerender(
      <ExamTakingView
        exam={exam}
        answers={{ q1: 'Option A' }}
        submitted={false}
        error=""
        loading={false}
        onSelectAnswer={() => {}}
        onSubmit={() => {}}
        onExit={() => {}}
      />
    );

    expect(submitBtn.disabled).toBe(false);
  });
});

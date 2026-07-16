import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, cleanup, fireEvent, waitFor } from '@testing-library/react';
import StudentPortal from '../StudentPortal';
import StudentExamList from '../components/StudentExamList';
import QuestionCard from '../components/QuestionCard';
import ExamTakingView from '../components/ExamTakingView';
import ScoreTable from '../components/ScoreTable';
import { getAllExams } from '../api/examService';

vi.mock('../api/examService', () => {
  return {
    getAllExams: vi.fn(),
    getExamById: vi.fn(),
    saveScore: vi.fn(),
    getStudentSubmissions: vi.fn().mockResolvedValue([]),
  };
});

vi.mock('../services/AuthService', () => {
  return {
    default: {
      getCurrentUser: vi.fn().mockReturnValue({
        id: 3,
        username: 'student1',
        fullName: 'Alice Johnson',
        role: 'STUDENT',
      }),
    },
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

  it('Score calculation is correct and saves score on submit', async () => {
    const mockExam = {
      id: 2,
      title: 'React Basics',
      status: 'published',
      questions: [
        {
          id: 'q1',
          text: 'Question 1',
          options: ['Yes', 'No'],
          correctAnswer: 'Yes',
        },
        {
          id: 'q2',
          text: 'Question 2',
          options: ['Yes', 'No'],
          correctAnswer: 'No',
        },
      ],
    };

    const { getExamById, saveScore } = await import('../api/examService');
    getAllExams.mockResolvedValue([mockExam]);
    getExamById.mockResolvedValue(mockExam);
    saveScore.mockResolvedValue({ success: true });

    render(<StudentPortal />);

    await waitFor(() => {
      expect(screen.getByText('React Basics')).toBeTruthy();
    });

    const startBtn = screen.getByRole('button', { name: /Start Exam/i });
    fireEvent.click(startBtn);

    await waitFor(() => {
      expect(screen.getByText('Question 1')).toBeTruthy();
    });

    const optionsQ1 = screen.getAllByRole('button', { name: 'Yes' });
    fireEvent.click(optionsQ1[0]);

    // Click Next button to navigate to Question 2 due to exam pagination
    const nextBtn = screen.getByRole('button', { name: /Next →/i });
    fireEvent.click(nextBtn);

    // Now select "Yes" option for Question 2 (which is index 0 on the screen now)
    const optionsQ2 = screen.getAllByRole('button', { name: 'Yes' });
    fireEvent.click(optionsQ2[0]);

    const submitBtn = screen.getByRole('button', { name: /Submit Assessment/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(saveScore).toHaveBeenCalledWith(
        expect.objectContaining({
          studentName: 'Alice Johnson',
          examId: 2,
          examTitle: 'React Basics',
          score: 50,
        })
      );
    });
  });

  it('Result summary displays correct answers/incorrect answers', () => {
    const question = {
      id: 'q1',
      text: 'What is state?',
      options: ['Option A', 'Option B'],
      correctAnswer: 'Option A',
    };

    const { rerender } = render(
      <QuestionCard
        question={question}
        idx={0}
        answers={{ q1: 'Option A' }}
        submitted={true}
        onSelectAnswer={() => {}}
      />
    );

    const btnA = screen.getByRole('button', { name: /Option A/ });
    expect(btnA.className).toContain('btn-success');

    rerender(
      <QuestionCard
        question={question}
        idx={0}
        answers={{ q1: 'Option B' }}
        submitted={true}
        onSelectAnswer={() => {}}
      />
    );

    const btnB = screen.getByRole('button', { name: /Option B/ });
    expect(btnB.className).toContain('btn-danger');
  });

  it('Teacher score table can show saved score', () => {
    const selectedExamScores = {
      examId: 2,
      scores: [
        { studentName: 'Alice Johnson', score: 85 },
        { studentName: 'Bob Smith', score: 72 },
      ],
    };

    render(
      <ScoreTable
        selectedExamScores={selectedExamScores}
        scoresLoading={false}
        onClose={() => {}}
      />
    );

    expect(screen.getByText(/Scores for Exam:.*Exam #2/i)).toBeTruthy();
    expect(screen.getByText('Alice Johnson')).toBeTruthy();
    expect(screen.getByText('85%')).toBeTruthy();
    expect(screen.getByText('Bob Smith')).toBeTruthy();
    expect(screen.getByText('72%')).toBeTruthy();
  });
});

// ============================================================
// Mock Database — simulates server-side data
// ============================================================

export const exams = [
  {
    id: 1,
    title: 'JavaScript Fundamentals',
    questions: [
      {
        id: 'q1',
        text: 'What keyword declares a block-scoped variable?',
        options: ['var', 'let', 'both', 'none'],
        correctAnswer: 'let',
      },
      {
        id: 'q2',
        text: 'Which method converts JSON text to an object?',
        options: ['JSON.parse()', 'JSON.stringify()', 'JSON.objectify()', 'JSON.convert()'],
        correctAnswer: 'JSON.parse()',
      },
      {
        id: 'q3',
        text: 'What does "===" check?',
        options: ['Value only', 'Type only', 'Value and type', 'Reference'],
        correctAnswer: 'Value and type',
      },
    ],
  },
  {
    id: 2,
    title: 'React Essentials',
    questions: [
      {
        id: 'q1',
        text: 'Which hook manages local component state?',
        options: ['useEffect', 'useState', 'useContext', 'useRef'],
        correctAnswer: 'useState',
      },
      {
        id: 'q2',
        text: 'What is JSX?',
        options: [
          'A CSS preprocessor',
          'A syntax extension for JavaScript',
          'A testing library',
          'A package manager',
        ],
        correctAnswer: 'A syntax extension for JavaScript',
      },
      {
        id: 'q3',
        text: 'Which hook runs side effects after render?',
        options: ['useState', 'useMemo', 'useEffect', 'useReducer'],
        correctAnswer: 'useEffect',
      },
      {
        id: 'q4',
        text: 'Props in React are:',
        options: ['Mutable', 'Read-only', 'Only strings', 'Only numbers'],
        correctAnswer: 'Read-only',
      },
    ],
  },
  {
    id: 3,
    title: 'Node.js Basics',
    questions: [
      {
        id: 'q1',
        text: 'Node.js is built on which engine?',
        options: ['SpiderMonkey', 'V8', 'Chakra', 'Hermes'],
        correctAnswer: 'V8',
      },
      {
        id: 'q2',
        text: 'Which module is used to create an HTTP server?',
        options: ['fs', 'path', 'http', 'url'],
        correctAnswer: 'http',
      },
    ],
  },
];

// ── Student Scores ─────────────────────────────────────────
export const studentScores = [
  { studentName: 'Alice Johnson', examId: 1, score: 85 },
  { studentName: 'Bob Smith', examId: 1, score: 72 },
  { studentName: 'Charlie Davis', examId: 2, score: 90 },
  { studentName: 'Diana Lee', examId: 2, score: 65 },
  { studentName: 'Ethan Brown', examId: 3, score: 95 },
  { studentName: 'Fiona Clark', examId: 1, score: 88 },
  { studentName: 'George Martin', examId: 3, score: 78 },
];

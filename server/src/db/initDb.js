import pool from './connect.js';
import bcrypt from 'bcryptjs';

/**
 * Checks if the users table exists. If not, creates the tables and seeds default data.
 * This runs automatically on server startup to initialize the Render Postgres DB.
 */
export async function initializeDatabase() {
  console.log('🔄 Checking database initialization...');
  try {
    // 1. Check if 'users' table exists
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `);

    const tableExists = tableCheck.rows[0].exists;

    if (tableExists) {
      console.log('✅ Database already initialized. Skipping auto-seed.');
      return;
    }

    console.log('🌱 Database is empty. Running schema and seeding default data...');

    // 2. Create users table
    await pool.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('TEACHER', 'STUDENT')),
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create exams table
    await pool.query(`
      CREATE TABLE exams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        time_limit INTEGER NOT NULL DEFAULT 60,
        passing_grade INTEGER NOT NULL DEFAULT 60,
        shuffle_questions BOOLEAN NOT NULL DEFAULT FALSE,
        questions JSONB NOT NULL,
        status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
        results_released BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Create submissions table
    await pool.query(`
      CREATE TABLE submissions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
        student_id UUID REFERENCES users(id) ON DELETE CASCADE,
        score INTEGER NOT NULL,
        answers JSONB NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Tables created successfully.');

    // 5. Seed Users
    const hashedPassword = bcrypt.hashSync('pass123', 10);
    const userInsertResult = await pool.query(`
      INSERT INTO users (username, password, role, name) VALUES
      ('teacher1', $1, 'TEACHER', 'Sarah Cohen'),
      ('teacher2', $1, 'TEACHER', 'David Levi'),
      ('student1', $1, 'STUDENT', 'Alice Johnson'),
      ('student2', $1, 'STUDENT', 'Bob Smith'),
      ('student3', $1, 'STUDENT', 'Charlie Davis')
      RETURNING id, username;
    `, [hashedPassword]);
    
    const userMap = {};
    userInsertResult.rows.forEach(row => {
      userMap[row.username] = row.id;
    });

    // 6. Seed Exams
    const javascriptQuestions = JSON.stringify([
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
      }
    ]);

    const reactQuestions = JSON.stringify([
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
      }
    ]);

    const examInsertResult = await pool.query(`
      INSERT INTO exams (title, time_limit, passing_grade, questions, status) VALUES
      ('JavaScript Fundamentals', 60, 60, $1, 'published'),
      ('React Essentials', 45, 70, $2, 'published')
      RETURNING id, title;
    `, [javascriptQuestions, reactQuestions]);

    const examMap = {};
    examInsertResult.rows.forEach(row => {
      examMap[row.title] = row.id;
    });

    // 7. Seed Submissions
    const aliceAnswers = JSON.stringify({ q1: 'let', q2: 'JSON.parse()', q3: 'Value and type' });
    const bobAnswers = JSON.stringify({ q1: 'let', q2: 'JSON.stringify()', q3: 'Value and type' });

    await pool.query(`
      INSERT INTO submissions (exam_id, student_id, score, answers) VALUES
      ($1, $2, 100, $3),
      ($1, $4, 66, $5)
    `, [
      examMap['JavaScript Fundamentals'],
      userMap['student1'], // Alice ($2)
      aliceAnswers,       // ($3)
      userMap['student2'], // Bob ($4)
      bobAnswers          // ($5)
    ]);

    console.log('🎉 Database seeding completed successfully.');
  } catch (error) {
    console.error('❌ Database auto-initialization failed:', error.message);
  }
}

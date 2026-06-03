import pool from './connect.js';

async function seed() {
  console.log('🌱 Starting database seeding...');

  try {
    // 1. Drop existing tables in reverse order of dependencies
    console.log('🗑️ Dropping existing tables...');
    await pool.query('DROP TABLE IF EXISTS submissions CASCADE;');
    await pool.query('DROP TABLE IF EXISTS exams CASCADE;');
    await pool.query('DROP TABLE IF EXISTS users CASCADE;');

    // 2. Create users table
    console.log('🛠️ Creating users table...');
    await pool.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('LECTURER', 'STUDENT')),
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create exams table
    console.log('🛠️ Creating exams table...');
    await pool.query(`
      CREATE TABLE exams (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        time_limit INTEGER NOT NULL DEFAULT 60,
        passing_grade INTEGER NOT NULL DEFAULT 60,
        questions JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 4. Create submissions table
    console.log('🛠️ Creating submissions table...');
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
    console.log('👥 Inserting users...');
    const userInsertResult = await pool.query(`
      INSERT INTO users (username, password, role, name) VALUES
      ('teacher1', 'pass123', 'LECTURER', 'Sarah Cohen'),
      ('teacher2', 'pass123', 'LECTURER', 'David Levi'),
      ('student1', 'pass123', 'STUDENT', 'Alice Johnson'),
      ('student2', 'pass123', 'STUDENT', 'Bob Smith'),
      ('student3', 'pass123', 'STUDENT', 'Charlie Davis')
      RETURNING id, username;
    `);
    
    // Map usernames to their generated UUIDs
    const userMap = {};
    userInsertResult.rows.forEach(row => {
      userMap[row.username] = row.id;
    });

    // 6. Seed Exams
    console.log('📝 Inserting exams...');
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
      INSERT INTO exams (title, time_limit, passing_grade, questions) VALUES
      ('JavaScript Fundamentals', 60, 60, $1),
      ('React Essentials', 45, 70, $2)
      RETURNING id, title;
    `, [javascriptQuestions, reactQuestions]);

    const examMap = {};
    examInsertResult.rows.forEach(row => {
      examMap[row.title] = row.id;
    });

        // 7. Seed Submissions (Scores)
    console.log('📊 Inserting submissions...');
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

    console.log('🎉 Seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
  } finally {
    await pool.end();
  }
}

seed();

import pool from './connect.js';

async function runTests() {
  console.log('🧪 Starting Database and JSONB Test Suite...\n');

  try {
    // -------------------------------------------------------------
    // 1. Connectivity Test: Retrieve and display exams and users
    // -------------------------------------------------------------
    console.log('-------------------------------------------------------------');
    console.log('🔍 Connectivity Test: Fetching users and exams...');
    console.log('-------------------------------------------------------------');
    
    // Fetch users
    const usersResult = await pool.query('SELECT id, username, name, role FROM users');
    console.log('\n👥 Users in database:');
    console.table(usersResult.rows);

    // Fetch exams
    const examsResult = await pool.query('SELECT id, title, time_limit, passing_grade FROM exams');
    console.log('\n📝 Exams in database:');
    console.table(examsResult.rows);


    // -------------------------------------------------------------
    // 2. JSONB Test: Retrieve specific exam & iterate through questions in a loop
    // -------------------------------------------------------------
    console.log('\n-------------------------------------------------------------');
    console.log('🎯 JSONB Test: Retrieving JavaScript Fundamentals questions...');
    console.log('-------------------------------------------------------------');
    
    const targetExamResult = await pool.query(
      "SELECT id, title, questions FROM exams WHERE title = 'JavaScript Fundamentals' LIMIT 1"
    );

    if (targetExamResult.rows.length > 0) {
      const exam = targetExamResult.rows[0];
      console.log(`Exam Title: ${exam.title}`);
      console.log(`Exam ID: ${exam.id}`);
      
      // questions is a JSONB array, pg parses it automatically into a JS array
      const questionsArray = exam.questions;
      console.log('\nIterating through questions as JSON objects in JS:');
      
      questionsArray.forEach((q, index) => {
        console.log(`\n[Question #${index + 1}]`);
        console.log(`  - ID: ${q.id}`);
        console.log(`  - Text: ${q.text}`);
        console.log(`  - Options: [ ${q.options.join(', ')} ]`);
        console.log(`  - Correct Answer: ${q.correctAnswer}`);
      });
    } else {
      console.log('⚠️ JavaScript Fundamentals exam not found.');
    }


    // -------------------------------------------------------------
    // 3. Database Query: Advanced JSONB elements expansion query
    // -------------------------------------------------------------
    console.log('\n-------------------------------------------------------------');
    console.log('⚡ Advanced Query: Expanding JSONB array elements in SQL');
    console.log('-------------------------------------------------------------');
    
    const query = `
      SELECT
        e.title AS exam_title,
        q->>'id' AS question_id,
        q->>'text' AS question_text,
        q->>'correctAnswer' AS correct_answer
      FROM exams e,
           jsonb_array_elements(e.questions) AS q;
    `;
    
    const queryResult = await pool.query(query);
    console.log('Query Results (Questions extracted from JSONB array via SQL):');
    console.table(queryResult.rows);

  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  } finally {
    await pool.end();
    console.log('\n🔌 Database connection closed. Test suite completed!');
  }
}

runTests();

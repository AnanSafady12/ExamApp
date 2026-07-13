-- 1. Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS submissions CASCADE;
DROP TABLE IF EXISTS exams CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 2. Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('TEACHER', 'STUDENT')),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create exams table (with JSONB questions)
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    time_limit INTEGER NOT NULL DEFAULT 60,
    passing_grade INTEGER NOT NULL DEFAULT 60,
    shuffle_questions BOOLEAN NOT NULL DEFAULT FALSE,
    questions JSONB NOT NULL, -- Hybrid approach: stores questions array as JSONB
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed')),
    results_released BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create submissions table (with JSONB answers)
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    answers JSONB NOT NULL, -- Hybrid approach: stores student answers as JSONB
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

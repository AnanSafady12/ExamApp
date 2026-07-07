import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes.js';
import examRoutes from './routes/examRoutes.js';
import scoreRoutes from './routes/scoreRoutes.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json());

// Log middleware to display server logs for each request
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Register routes
app.use('/api/users', userRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/scores', scoreRoutes);

// Start listening
app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 ExamApp Server running on port ${PORT}`);
  console.log(`=========================================`);
});

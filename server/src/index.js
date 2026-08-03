import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import userRoutes from './routes/userRoutes.js';
import examRoutes from './routes/examRoutes.js';
import scoreRoutes from './routes/scoreRoutes.js';
import { initSocket } from './services/socketHandler.js';
import { initializeDatabase } from './db/initDb.js';

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;

// Initialize Database automatically if empty
await initializeDatabase();

// Initialize WebSockets
initSocket(server);

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

// Start listening via the HTTP server instead of Express app directly
server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 ExamApp Server running on port ${PORT}`);
  console.log(`=========================================`);
});

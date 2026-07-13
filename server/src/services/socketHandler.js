import { Server } from 'socket.io';

let io;

// In-memory store for chat messages: examId -> array of messages
const chatHistory = new Map();

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: "*", // In production, restrict this to your frontend URL
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 New client connected: ${socket.id}`);

    // Join a specific exam chat room
    socket.on('join_exam_chat', ({ examId, user }) => {
      if (!user || !examId) return;
      
      const role = user?.role || 'STUDENT';
      const personalRoom = `exam_${examId}_user_${user.id}`;
      const teacherRoom = `exam_${examId}_teachers`;
      const allRoom = `exam_${examId}_all`;

      socket.join(personalRoom);
      socket.join(allRoom);
      if (role === 'TEACHER') {
        socket.join(teacherRoom);
      }

      console.log(`👤 User ${user?.name} (Role: ${role}) joined exam: ${examId}`);

      // Send chat history to the newly connected user
      const history = chatHistory.get(examId) || [];
      const filteredHistory = role === 'TEACHER' 
        ? history 
        : history.filter(msg => 
            msg.target === 'all' || 
            msg.sender.id === user.id || 
            msg.target === user.id
          );
      
      socket.emit('chat_history', filteredHistory);
    });

    // Handle sending messages
    socket.on('send_message', (data) => {
      const { examId, message, user, target = 'teacher' } = data;
      
      const chatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        examId,
        text: message,
        sender: user,
        target,
        timestamp: new Date().toISOString()
      };

      // Store in history
      if (!chatHistory.has(examId)) {
        chatHistory.set(examId, []);
      }
      chatHistory.get(examId).push(chatMessage);

      // Route the message
      if (target === 'all') {
        io.to(`exam_${examId}_all`).emit('receive_message', chatMessage);
      } else if (target === 'teacher') {
        io.to(`exam_${examId}_teachers`).emit('receive_message', chatMessage);
        io.to(`exam_${examId}_user_${user.id}`).emit('receive_message', chatMessage);
      } else {
        // Target is specific student ID
        io.to(`exam_${examId}_user_${target}`).emit('receive_message', chatMessage);
        io.to(`exam_${examId}_teachers`).emit('receive_message', chatMessage);
      }

      console.log(`💬 Message sent in exam ${examId} by ${user?.name} to ${target}: ${message}`);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

export const clearStudentChat = (examId, studentId) => {
  if (chatHistory.has(examId)) {
    const history = chatHistory.get(examId);
    const newHistory = history.filter(msg => 
      !(msg.sender?.id === studentId || msg.target === studentId)
    );
    chatHistory.set(examId, newHistory);
    console.log(`🧹 Cleared chat history for student ${studentId} in exam ${examId}`);
  }
};

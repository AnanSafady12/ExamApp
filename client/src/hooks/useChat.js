import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const SOCKET_SERVER_URL = 'http://localhost:3001';

export const useChat = (examId, user) => {
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!examId || !user?.id) return;

    // Connect to the socket server
    socketRef.current = io(SOCKET_SERVER_URL);

    // Connection events
    socketRef.current.on('connect', () => {
      setIsConnected(true);
      // Join the specific exam room when connected
      socketRef.current.emit('join_exam_chat', { examId, user });
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for initial chat history
    socketRef.current.on('chat_history', (history) => {
      setMessages(history);
    });

    // Listen for incoming messages
    socketRef.current.on('receive_message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [examId, user?.id]);

  // Method to send a new message
  const sendMessage = (text, target = 'teacher') => {
    if (socketRef.current && isConnected && text.trim() !== '') {
      socketRef.current.emit('send_message', {
        examId,
        message: text,
        user,
        target
      });
    }
  };

  return { messages, isConnected, sendMessage };
};

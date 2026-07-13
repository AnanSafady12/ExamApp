import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import notificationService from '../services/NotificationService';
import authService from '../services/AuthService';

const SOCKET_SERVER_URL = 'http://localhost:3001';

export const useTeacherNotifications = (exams, monitoringExamId) => {
  const socketRef = useRef(null);
  const user = authService.getCurrentUser();
  const [unreadCounts, setUnreadCounts] = useState({});

  // We use a ref to track the currently monitored exam so the socket listener
  // always has access to the freshest value without needing to be re-bound.
  const monitoringRef = useRef(monitoringExamId);
  useEffect(() => {
    monitoringRef.current = monitoringExamId;
    if (monitoringExamId) {
      // Clear unread count when opening the monitor
      setUnreadCounts(prev => ({ ...prev, [monitoringExamId]: 0 }));
    }
  }, [monitoringExamId]);

  useEffect(() => {
    if (!user || user.role !== 'TEACHER') return;

    socketRef.current = io(SOCKET_SERVER_URL);

    socketRef.current.on('connect', () => {
      // Join all published exam rooms to listen for messages
      exams.forEach(exam => {
        if (exam.status === 'published') {
          socketRef.current.emit('join_exam_chat', { examId: exam.id, user });
        }
      });
    });

    socketRef.current.on('receive_message', (message) => {
      // If the message is from a student
      if (message.sender?.id !== user.id) {
        // And we are NOT currently monitoring that specific exam
        if (monitoringRef.current !== message.examId) {
          const exam = exams.find(e => e.id === message.examId);
          const examTitle = exam ? exam.title : 'an exam';
          notificationService.info(
            `💬 New message from ${message.sender?.name} in ${examTitle}: "${message.text}"`
          );

          // Increment unread count
          setUnreadCounts(prev => ({
            ...prev,
            [message.examId]: (prev[message.examId] || 0) + 1
          }));
        }
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [exams, user?.id]);

  return { unreadCounts };
};

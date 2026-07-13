import React, { useState, useEffect, useRef } from 'react';
import { useChat } from '../hooks/useChat';
import authService from '../services/AuthService';
import './ChatWidget.css';

function ChatWidget({ examId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const currentUser = authService.getCurrentUser();
  
  const { messages, isConnected, sendMessage } = useChat(examId, currentUser);
  const messagesEndRef = useRef(null);
  const lastMessageLength = useRef(0);

  // Track unread messages from teacher
  useEffect(() => {
    if (messages.length > lastMessageLength.current) {
      const newMessages = messages.slice(lastMessageLength.current);
      if (!isOpen) {
        const unreadFromTeacher = newMessages.filter(m => m.sender?.role === 'TEACHER').length;
        if (unreadFromTeacher > 0) {
          setUnreadCount(prev => prev + unreadFromTeacher);
        }
      }
    }
    lastMessageLength.current = messages.length;
  }, [messages, isOpen]);

  // Clear unread count when opened
  useEffect(() => {
    if (isOpen) setUnreadCount(0);
  }, [isOpen]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputText.trim() === '') return;
    sendMessage(inputText);
    setInputText('');
  };

  return (
    <div className={`chat-widget ${isOpen ? 'open' : 'closed'}`}>
      {!isOpen ? (
        <button 
          className="chat-toggle-btn" 
          onClick={() => setIsOpen(true)}
        >
          💬 Ask Teacher
          {unreadCount > 0 && <span className="chat-badge">{unreadCount}</span>}
        </button>
      ) : (
        <div className="chat-window shadow rounded">
          <div className="chat-header bg-primary text-white p-2 d-flex justify-content-between align-items-center">
            <h6 className="mb-0">
              {isConnected ? '🟢 Live Support' : '🔴 Disconnected'}
            </h6>
            <button className="btn-close btn-close-white" onClick={() => setIsOpen(false)}></button>
          </div>
          
          <div className="chat-messages p-2" style={{ height: '300px', overflowY: 'auto', backgroundColor: '#f8f9fa' }}>
            {messages.length === 0 ? (
              <p className="text-muted text-center mt-4 small">No messages yet. Say hello!</p>
            ) : (
              messages.map((msg) => {
                const isMe = msg.sender?.id === currentUser?.id;
                return (
                  <div key={msg.id} className={`d-flex mb-2 ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
                    <div 
                      className={`p-2 rounded ${isMe ? 'bg-primary text-white' : 'bg-white border'}`}
                      style={{ maxWidth: '80%', fontSize: '0.9rem' }}
                    >
                      {!isMe && (
                        <small className="d-block text-muted mb-1" style={{ fontSize: '0.7rem' }}>
                          {msg.sender?.role === 'TEACHER' ? '👨‍🏫 Teacher' : msg.sender?.name}
                          {msg.target === 'all' && <span className="badge bg-info text-dark ms-2" style={{ fontSize: '0.6rem' }}>Broadcast</span>}
                          {msg.target === currentUser?.id && <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '0.6rem' }}>Private</span>}
                        </small>
                      )}
                      {msg.text}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="chat-input p-2 border-top bg-white d-flex gap-2">
            <input 
              type="text" 
              className="form-control form-control-sm"
              placeholder="Type a message..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={!isConnected}
            />
            <button type="submit" className="btn btn-primary btn-sm" disabled={!isConnected || inputText.trim() === ''}>
              Send
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default ChatWidget;

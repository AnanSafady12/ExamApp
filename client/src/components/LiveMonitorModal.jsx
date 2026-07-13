import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useChat } from '../hooks/useChat';
import authService from '../services/AuthService';

function LiveMonitorModal({ exam, onClose }) {
  const currentUser = authService.getCurrentUser();
  const { messages, isConnected, sendMessage } = useChat(exam.id, currentUser);
  const [inputText, setInputText] = useState('');
  const [target, setTarget] = useState('all');
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Extract unique students who have sent a message
  const activeStudents = useMemo(() => {
    const students = new Map();
    messages.forEach(msg => {
      if (msg.sender?.role === 'STUDENT') {
        students.set(msg.sender.id, msg.sender);
      }
    });
    return Array.from(students.values());
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputText.trim() === '') return;
    sendMessage(inputText, target);
    setInputText('');
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px', overflow: 'hidden' }}>
          <div className="modal-header text-white" style={{ background: 'var(--primary)', padding: '1.5rem' }}>
            <h5 className="modal-title fw-bold">
              📡 Live Monitor: {exam.title}
              <span className={`badge ms-3 ${isConnected ? 'bg-success' : 'bg-danger'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          
          <div className="modal-body p-0" style={{ backgroundColor: '#f8f9fa' }}>
            <div className="row g-0">
              {/* Main Chat Area */}
              <div className="col-12 d-flex flex-column" style={{ height: '500px' }}>
                
                <div className="flex-grow-1 p-4" style={{ overflowY: 'auto' }}>
                  {messages.length === 0 ? (
                    <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                      <p className="mb-0">No active messages in this exam yet.</p>
                      <small>Messages from all students will appear here.</small>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isTeacher = msg.sender?.role === 'TEACHER';
                      const isMe = msg.sender?.id === currentUser?.id;

                      let targetBadge = null;
                      if (msg.target === 'all') {
                        targetBadge = <span className="badge bg-info text-dark ms-2" style={{ fontSize: '0.65rem' }}>Broadcast</span>;
                      } else if (msg.target !== 'teacher' && isTeacher) {
                        const targetStudent = activeStudents.find(s => s.id === msg.target);
                        targetBadge = <span className="badge bg-warning text-dark ms-2" style={{ fontSize: '0.65rem' }}>Private Reply to {targetStudent?.name || 'Student'}</span>;
                      } else if (msg.target === 'teacher' && !isTeacher) {
                        targetBadge = <span className="badge bg-secondary ms-2" style={{ fontSize: '0.65rem' }}>To Teacher</span>;
                      }

                      return (
                        <div key={msg.id} className={`d-flex mb-3 ${isMe ? 'justify-content-end' : 'justify-content-start'}`}>
                          <div 
                            className={`p-3 rounded-3 shadow-sm ${isMe ? 'bg-primary text-white' : (isTeacher ? 'bg-dark text-white' : 'bg-white border')}`}
                            style={{ maxWidth: '75%' }}
                          >
                            <div className="d-flex align-items-center gap-2 mb-1 border-bottom pb-1" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                              <span className={`badge ${isTeacher ? 'bg-primary' : 'bg-secondary'}`} style={{ fontSize: '0.65rem' }}>
                                {msg.sender?.role}
                              </span>
                              <small className="fw-bold" style={{ fontSize: '0.8rem' }}>{isMe ? 'You' : msg.sender?.name}</small>
                              {targetBadge}
                            </div>
                            <div style={{ fontSize: '0.95rem' }}>{msg.text}</div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-3 bg-white border-top">
                  <form onSubmit={handleSend} className="d-flex gap-2 align-items-center">
                    <select 
                      className="form-select w-auto fw-bold" 
                      value={target} 
                      onChange={(e) => setTarget(e.target.value)}
                      style={{ fontSize: '0.9rem' }}
                    >
                      <option value="all">📢 Broadcast to All</option>
                      {activeStudents.map(s => (
                        <option key={s.id} value={s.id}>🔒 Reply: {s.name}</option>
                      ))}
                    </select>

                    <input 
                      type="text" 
                      className="form-control"
                      placeholder={target === 'all' ? "Type a broadcast to all students..." : "Type a private reply..."}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      disabled={!isConnected}
                    />
                    <button 
                      type="submit" 
                      className="btn btn-primary px-4 fw-bold" 
                      disabled={!isConnected || inputText.trim() === ''}
                    >
                      Send
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveMonitorModal;

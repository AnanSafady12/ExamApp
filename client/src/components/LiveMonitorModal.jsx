import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useChat } from '../hooks/useChat';
import authService from '../services/AuthService';

function LiveMonitorModal({ exam, onClose }) {
  const currentUser = authService.getCurrentUser();
  const { messages, isConnected, sendMessage, studentProgress } = useChat(exam.id, currentUser);
  const [inputText, setInputText] = useState('');
  const [target, setTarget] = useState('all');
  const [currentTime, setCurrentTime] = useState(Date.now());
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Sync current time periodically to update online/offline indicators
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 3000);
    return () => clearInterval(timeInterval);
  }, []);

  // Format countdown remaining seconds to MM:SS format
  const formatTime = (seconds) => {
    if (seconds <= 0) return '00:00';
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Extract unique students who have sent a message
  const activeStudents = useMemo(() => {
    const students = new Map();
    
    // First seed students from progress updates
    Object.values(studentProgress).forEach(prog => {
      students.set(prog.studentId, {
        id: prog.studentId,
        name: prog.studentName
      });
    });

    // Then seed any student who sent a message in case progress hasn't synced
    messages.forEach(msg => {
      if (msg.sender?.role === 'STUDENT') {
        students.set(msg.sender.id, msg.sender);
      }
    });

    return Array.from(students.values());
  }, [messages, studentProgress]);

  const handleSend = (e) => {
    e.preventDefault();
    if (inputText.trim() === '') return;
    sendMessage(inputText, target);
    setInputText('');
  };

  return (
    <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: '15px', overflow: 'hidden' }}>
          <div className="modal-header text-white" style={{ background: 'var(--primary)', padding: '1.2rem 1.5rem' }}>
            <h5 className="modal-title fw-bold">
              📡 Live Monitor: {exam.title}
              <span className={`badge ms-3 ${isConnected ? 'bg-success' : 'bg-danger'}`}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          
          <div className="modal-body p-0" style={{ backgroundColor: 'var(--bg)' }}>
            <div className="row g-0">
              {/* Left Column: Chat Area */}
              <div className="col-md-8 col-12 d-flex flex-column border-end" style={{ height: '500px' }}>
                <div className="px-3 py-2 border-bottom d-flex align-items-center justify-content-between" style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
                  <span className="fw-bold text-muted" style={{ fontSize: '13px', letterSpacing: '0.05em', color: 'var(--text-muted)' }}>💬 CHAT SUPPORT PANEL</span>
                </div>

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
                            style={{ 
                              maxWidth: '75%', 
                              backgroundColor: isMe ? '' : (isTeacher ? '' : 'var(--bg-card)'),
                              borderColor: isMe ? '' : (isTeacher ? '' : 'var(--border)'),
                              color: isMe ? '' : (isTeacher ? '' : 'var(--text)')
                            }}
                          >
                            <div className="d-flex align-items-center gap-2 mb-1 border-bottom pb-1" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>
                              <span className={`badge ${isTeacher ? 'bg-primary' : 'bg-secondary'}`} style={{ fontSize: '0.65rem' }}>
                                {msg.sender?.role}
                              </span>
                              <small className="fw-bold" style={{ fontSize: '0.8rem', color: isMe ? '#fff' : (isTeacher ? '#fff' : 'var(--text-h)') }}>{isMe ? 'You' : msg.sender?.name}</small>
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
                <div className="p-3 border-top" style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border)' }}>
                  <form onSubmit={handleSend} className="d-flex gap-2 align-items-center">
                    <select 
                      className="form-select w-auto fw-bold" 
                      value={target} 
                      onChange={(e) => setTarget(e.target.value)}
                      style={{ fontSize: '0.9rem', backgroundColor: 'var(--bg-card)', color: 'var(--text-h)', borderColor: 'var(--border)' }}
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
                      style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-h)', borderColor: 'var(--border)' }}
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

              {/* Right Column: Live Student Activity Board */}
              <div className="col-md-4 col-12 d-flex flex-column" style={{ height: '500px', backgroundColor: 'var(--bg)' }}>
                <div className="px-3 py-2 border-bottom d-flex align-items-center" style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
                  <span className="fw-bold" style={{ fontSize: '13px', letterSpacing: '0.05em', color: 'var(--text-h)' }}>👥 LIVE STUDENT ACTIVITY</span>
                </div>

                <div className="flex-grow-1 p-3" style={{ overflowY: 'auto' }}>
                  {Object.keys(studentProgress).length === 0 ? (
                    <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted text-center p-3">
                      <svg style={{ width: '36px', height: '36px', opacity: 0.5 }} className="mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <small className="d-block" style={{ color: 'var(--text-muted)' }}>No students are currently taking this exam.</small>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2">
                      {Object.values(studentProgress).map((student) => {
                        const isOnline = (currentTime - student.lastActive) < 10000; // Active within last 10 seconds
                        const hasWarnings = student.warnings > 0;
                        
                        return (
                          <div 
                            key={student.studentId} 
                            className="p-3 rounded-3 shadow-sm transition-all"
                            style={{ 
                              opacity: isOnline ? 1 : 0.65,
                              backgroundColor: 'var(--bg-card)',
                              border: '1px solid var(--border)',
                              borderLeft: hasWarnings
                                ? '4px solid #dc3545'
                                : (isOnline ? '4px solid #28a745' : '4px solid #6c757d')
                            }}
                          >
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <span className="fw-bold text-truncate" style={{ maxWidth: '140px', color: 'var(--text-h)' }}>
                                {student.studentName}
                                {hasWarnings && (
                                  <span className="badge bg-danger text-white ms-2 animate-pulse" style={{ fontSize: '10px', borderRadius: '4px', padding: '3px 6px' }} title={`${student.warnings} tab switch violations detected!`}>
                                    ⚠️ {student.warnings}
                                  </span>
                                )}
                              </span>
                              <span 
                                className="badge fw-bold" 
                                style={{ 
                                  fontSize: '10px', 
                                  borderRadius: '6px',
                                  padding: '4px 8px',
                                  backgroundColor: isOnline ? 'rgba(40, 167, 69, 0.1)' : 'rgba(108, 117, 125, 0.1)',
                                  color: isOnline ? '#28a745' : '#6c757d'
                                }}
                              >
                                {isOnline ? '🟢 Online' : '⚪ Offline'}
                              </span>
                            </div>
                            
                            <div className="d-flex justify-content-between align-items-center" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                              <span>Progress: <strong style={{ color: 'var(--text-h)' }}>Question {student.currentQuestion}/{student.totalQuestions}</strong></span>
                              <span className="fw-bold" style={{ color: 'var(--text-h)' }}>⏱️ {formatTime(student.timeLeft)}</span>
                            </div>

                            {/* Progress Mini-Bar */}
                            <div className="progress mt-2" style={{ height: '4px', backgroundColor: 'var(--border)', borderRadius: '2px' }}>
                              <div 
                                className={`progress-bar ${isOnline ? 'bg-success' : 'bg-secondary'}`}
                                style={{ width: `${(student.currentQuestion / student.totalQuestions) * 100}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
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

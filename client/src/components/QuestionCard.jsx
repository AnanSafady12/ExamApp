// Renders a single question card (Multiple Choice, True/False, or Short Answer) with active selection indicators and final feedback grading highlights
function QuestionCard({ question, idx, answers, submitted, onSelectAnswer }) {
  const type = question.type || 'MULTIPLE_CHOICE';
  const studentAnswer = answers[question.id] || '';
  const correctAnswer = question.correctAnswer || '';

  // Case-insensitive trimmed check for short answer correctness
  const isShortAnswerCorrect =
    type === 'SHORT_ANSWER' &&
    studentAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();

  return (
    <div className="card-premium mb-4" style={{ padding: '24px' }}>
      {/* Renders the question index number and question text */}
      <div className="d-flex align-items-start mb-3">
        <span
          className="badge bg-dark rounded-circle me-3 d-flex align-items-center justify-content-center fw-bold"
          style={{ width: 30, height: 30, flexShrink: 0, fontSize: '14px', background: 'var(--text-h)' }}
        >
          {idx + 1}
        </span>
        <h4 className="fw-bold mb-0 pt-1" style={{ color: 'var(--text-h)', fontSize: '1.15rem', lineHeight: '1.4' }}>
          {question.text}
        </h4>
      </div>

      {/* Renders option buttons for MULTIPLE_CHOICE and TRUE_FALSE */}
      {(type === 'MULTIPLE_CHOICE' || type === 'TRUE_FALSE') && (
        <div className="options-list mt-4 d-flex flex-column gap-2">
          {(question.options || []).map((opt) => {
            let cardClass = 'option-card option-btn btn btn-outline-secondary';
            
            if (submitted) {
              if (opt === correctAnswer) {
                cardClass = 'option-card correct option-btn btn btn-success';
              } else if (studentAnswer === opt && opt !== correctAnswer) {
                cardClass = 'option-card incorrect option-btn btn btn-danger';
              } else {
                cardClass = 'option-card option-btn btn btn-outline-secondary opacity-50';
              }
            } else if (studentAnswer === opt) {
              cardClass = 'option-card selected option-btn btn btn-primary active';
            }

            return (
              <button
                key={opt}
                className={cardClass}
                disabled={submitted}
                onClick={() => onSelectAnswer(question.id, opt)}
                style={{ textAlign: 'left', width: '100%', borderStyle: 'solid', display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <div className="d-flex justify-content-between align-items-center w-100">
                  <span style={{ fontSize: '15px' }}>{opt}</span>
                  
                  {/* Checkmark icon for currently selected answers before submitting */}
                  {!submitted && studentAnswer === opt && (
                    <span aria-hidden="true" className="badge text-white rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px', background: 'var(--primary)', fontSize: '11px' }}>
                      ✓
                    </span>
                  )}
                  
                  {/* Visual success badge for correct answer highlights */}
                  {submitted && opt === correctAnswer && (
                    <span aria-hidden="true" className="badge text-white rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px', background: 'var(--success)', fontSize: '11px' }}>
                      ✓
                    </span>
                  )}
                  
                  {/* Visual error badge for selected incorrect answer highlights */}
                  {submitted && studentAnswer === opt && opt !== correctAnswer && (
                    <span aria-hidden="true" className="badge text-white rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px', background: 'var(--danger)', fontSize: '11px' }}>
                      ✕
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Renders text box input for SHORT_ANSWER */}
      {type === 'SHORT_ANSWER' && (
        <div className="mt-4">
          {!submitted ? (
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Type your short answer here..."
              value={studentAnswer}
              onChange={(e) => onSelectAnswer(question.id, e.target.value)}
              style={{ borderRadius: '12px', border: '1.5px solid var(--border)', background: 'var(--bg-card)', fontSize: '15px' }}
            />
          ) : (
            <div className="d-flex flex-column gap-2 mt-2">
              <div
                className={`p-3 border rounded-3 d-flex justify-content-between align-items-center ${
                  isShortAnswerCorrect ? 'border-success bg-success-subtle text-success-emphasis' : 'border-danger bg-danger-subtle text-danger-emphasis'
                }`}
                style={{
                  background: isShortAnswerCorrect ? '#e8f5e9' : '#ffebee',
                  borderColor: isShortAnswerCorrect ? '#2e7d32' : '#c62828',
                  color: isShortAnswerCorrect ? '#1b5e20' : '#b71c1c'
                }}
              >
                <div>
                  <span className="fw-bold block mb-1">Your Answer:</span>
                  <span className="ms-2" style={{ fontSize: '16px' }}>{studentAnswer || '(No answer provided)'}</span>
                </div>
                <span className="fw-bold" style={{ fontSize: '1.2rem' }}>
                  {isShortAnswerCorrect ? '✓ Correct' : '✕ Incorrect'}
                </span>
              </div>
              
              {!isShortAnswerCorrect && (
                <div
                  className="p-3 border rounded-3"
                  style={{
                    background: '#e8f5e9',
                    borderColor: '#2e7d32',
                    color: '#1b5e20'
                  }}
                >
                  <span className="fw-bold">Correct Answer:</span>
                  <span className="ms-2" style={{ fontSize: '16px' }}>{correctAnswer}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QuestionCard;

// Renders a single multiple-choice question card with active selection indicators and final feedback grading highlights
function QuestionCard({ question, idx, answers, submitted, onSelectAnswer }) {
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

      {/* Renders the list of multiple choice options */}
      <div className="options-list mt-4 d-flex flex-column gap-2">
        {question.options.map((opt) => {
          let cardClass = 'option-card option-btn btn btn-outline-secondary';
          
          // Determine the CSS styling of the option buttons depending on state (active, correct, incorrect)
          if (submitted) {
            if (opt === question.correctAnswer) {
              cardClass = 'option-card correct option-btn btn btn-success';
            } else if (answers[question.id] === opt && opt !== question.correctAnswer) {
              cardClass = 'option-card incorrect option-btn btn btn-danger';
            } else {
              cardClass = 'option-card option-btn btn btn-outline-secondary opacity-50';
            }
          } else if (answers[question.id] === opt) {
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
                {!submitted && answers[question.id] === opt && (
                  <span aria-hidden="true" className="badge text-white rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px', background: 'var(--primary)', fontSize: '11px' }}>
                    ✓
                  </span>
                )}
                
                {/* Visual success badge for correct answer highlights */}
                {submitted && opt === question.correctAnswer && (
                  <span aria-hidden="true" className="badge text-white rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px', background: 'var(--success)', fontSize: '11px' }}>
                    ✓
                  </span>
                )}
                
                {/* Visual error badge for selected incorrect answer highlights */}
                {submitted && answers[question.id] === opt && opt !== question.correctAnswer && (
                  <span aria-hidden="true" className="badge text-white rounded-circle p-0 d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px', background: 'var(--danger)', fontSize: '11px' }}>
                    ✕
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default QuestionCard;

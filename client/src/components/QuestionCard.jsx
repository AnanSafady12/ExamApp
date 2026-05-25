function QuestionCard({ question, idx, answers, submitted, onSelectAnswer }) {
  return (
    <div className="question-box shadow-sm">
      <div className="d-flex mb-3">
        <span
          className="badge bg-dark rounded-circle me-3 d-flex align-items-center justify-content-center"
          style={{ width: 28, height: 28, flexShrink: 0 }}
        >
          {idx + 1}
        </span>
        <h5 className="fw-bold mb-0 pt-1">{question.text}</h5>
      </div>

      <div className="options-list mt-4">
        {question.options.map((opt) => {
          let btnClass = 'option-btn btn btn-outline-secondary';
          if (submitted) {
            if (opt === question.correctAnswer) {
              btnClass = 'option-btn btn btn-success';
            } else if (answers[question.id] === opt && opt !== question.correctAnswer) {
              btnClass = 'option-btn btn btn-danger';
            } else {
              btnClass = 'option-btn btn btn-outline-secondary opacity-50';
            }
          } else if (answers[question.id] === opt) {
            btnClass = 'option-btn btn btn-primary active shadow-sm';
          }

          return (
            <button
              key={opt}
              className={btnClass}
              disabled={submitted}
              onClick={() => onSelectAnswer(question.id, opt)}
            >
              <div className="d-flex justify-content-between align-items-center w-100">
                <span>{opt}</span>
                {!submitted && answers[question.id] === opt && (
                  <span className="badge bg-white text-primary rounded-circle p-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      viewBox="0 0 16 16"
                    >
                      <path d="M12.736 3.97a.733.733 0 0 1 1.047 0c.286.289.29.756.01 1.05L7.88 12.01a.733.733 0 0 1-1.065.02L3.217 8.384a.757.757 0 0 1 0-1.06.733.733 0 0 1 1.047 0l3.052 3.093 5.4-6.446z" />
                    </svg>
                  </span>
                )}
                {submitted && opt === question.correctAnswer && (
                  <span className="badge bg-white text-success rounded-circle p-1">✓</span>
                )}
                {submitted && answers[question.id] === opt && opt !== question.correctAnswer && (
                  <span className="badge bg-white text-danger rounded-circle p-1">✕</span>
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

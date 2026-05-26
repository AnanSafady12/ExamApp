import { useState, useEffect } from 'react';

// Generates an empty question structure with unique random IDs
const EMPTY_QUESTION = () => ({
  id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
  text: '',
  options: ['', '', '', ''],
  correctAnswer: '',
});

// Form component that manages inputs to create new exams or edit existing ones
function ExamForm({ exam, onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState([EMPTY_QUESTION()]);
  const [errors, setErrors] = useState({});

  const isEditing = Boolean(exam);

  // Load exam title and existing questions if mounting in editing mode
  useEffect(() => {
    if (exam) {
      setTitle(exam.title);
      setQuestions(
        exam.questions.map((q) => ({
          id: q.id,
          text: q.text,
          options: [...q.options],
          correctAnswer: q.correctAnswer,
        }))
      );
    }
  }, [exam]);

  // Performs validation on form fields before submitting
  const validate = () => {
    const newErrors = {};

    if (!title.trim()) {
      newErrors.title = 'Exam title is required';
    }

    if (questions.length === 0) {
      newErrors.questions = 'At least one question is required';
    }

    questions.forEach((q, i) => {
      if (!q.text.trim()) {
        newErrors[`q_${i}_text`] = `Question ${i + 1} text is required`;
      }
      q.options.forEach((opt, j) => {
        if (!opt.trim()) {
          newErrors[`q_${i}_opt_${j}`] = `Question ${i + 1}, option ${j + 1} is required`;
        }
      });
      if (!q.correctAnswer) {
        newErrors[`q_${i}_answer`] = `Question ${i + 1} must have a correct answer selected`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form submit handler that triggers the save/update API
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      questions: questions.map((q) => ({
        id: q.id,
        text: q.text.trim(),
        options: q.options.map((o) => o.trim()),
        correctAnswer: q.correctAnswer,
      })),
    });
  };

  // Updates the text or correct answer fields of a specific question index
  const updateQuestion = (index, field, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Updates specific choice options of a chosen question index
  const updateOption = (qIndex, oIndex, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const opts = [...updated[qIndex].options];
      opts[oIndex] = value;
      updated[qIndex] = { ...updated[qIndex], options: opts };
      return updated;
    });
  };

  // Appends a new blank question section to the form
  const addQuestion = () => {
    setQuestions((prev) => [...prev, EMPTY_QUESTION()]);
  };

  // Slices/removes a targeted question index section from the form list
  const removeQuestion = (index) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="card-premium mb-4" style={{ padding: '28px' }}>
      <h4 className="fw-bold mb-4" style={{ color: 'var(--text-h)', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
        {isEditing ? 'Edit Exam' : 'Create New Exam'}
      </h4>

      <form onSubmit={handleSubmit}>
        {/* Title Input field */}
        <div className="mb-4">
          <label htmlFor="exam-title" className="form-label fw-bold small text-uppercase" style={{ color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            Exam Title
          </label>
          <input
            id="exam-title"
            type="text"
            className={`form-control form-control-lg ${errors.title ? 'is-invalid' : ''}`}
            placeholder="Enter exam title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ borderRadius: '12px', fontSize: '16px', border: '1.5px solid var(--border)', background: 'var(--bg-card)' }}
          />
          {errors.title && <div className="invalid-feedback">{errors.title}</div>}
        </div>

        {/* Validation warnings alerts */}
        {errors.questions && (
          <div className="alert alert-danger border-0" style={{ borderRadius: '12px', background: 'var(--danger-light)', color: 'var(--danger)' }}>
            ⚠️ {errors.questions}
          </div>
        )}

        {/* Dynamically renders sections for each question in the form */}
        <div className="d-flex flex-column gap-3 mb-4">
          {questions.map((q, qIndex) => (
            <div
              key={q.id}
              className="p-4 border rounded-4"
              style={{ background: 'var(--primary-light)', borderColor: 'var(--primary-border)' }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-bold mb-0" style={{ color: 'var(--primary)', fontSize: '1.1rem' }}>
                  Question {qIndex + 1}
                </h5>
                {questions.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-outline-danger btn-sm border-0 px-3 py-1 fw-bold"
                    onClick={() => removeQuestion(qIndex)}
                    style={{ borderRadius: '8px', background: 'var(--danger-light)', color: 'var(--danger)' }}
                  >
                    Remove
                  </button>
                )}
              </div>

              {/* Question Text Input */}
              <div className="mb-3">
                <input
                  type="text"
                  className={`form-control ${errors[`q_${qIndex}_text`] ? 'is-invalid' : ''}`}
                  placeholder="Question text..."
                  value={q.text}
                  onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                  style={{ borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--bg-card)' }}
                />
                {errors[`q_${qIndex}_text`] && (
                  <div className="invalid-feedback">{errors[`q_${qIndex}_text`]}</div>
                )}
              </div>

              {/* Grid holding the 4 multiple-choice options inputs */}
              <div className="row g-2 mb-3">
                {q.options.map((opt, oIndex) => (
                  <div className="col-md-6" key={oIndex}>
                    <div className="input-group">
                      <span className="input-group-text fw-bold text-muted border-0" style={{ borderRadius: '10px 0 0 10px', background: 'var(--border)' }}>
                        {String.fromCharCode(65 + oIndex)}
                      </span>
                      <input
                        type="text"
                        className={`form-control ${errors[`q_${qIndex}_opt_${oIndex}`] ? 'is-invalid' : ''}`}
                        placeholder={`Option ${oIndex + 1}`}
                        value={opt}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        style={{ borderRadius: '0 10px 10px 0', border: '1.5px solid var(--border)', background: 'var(--bg-card)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Select menu to specify the correct choice out of options */}
              <div>
                <label className="form-label fw-bold small text-uppercase" style={{ color: 'var(--text-muted)', fontSize: '11px', letterSpacing: '0.05em' }}>
                  Correct Option Choice
                </label>
                <select
                  className={`form-select ${errors[`q_${qIndex}_answer`] ? 'is-invalid' : ''}`}
                  value={q.correctAnswer}
                  onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                  style={{ borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--bg-card)' }}
                >
                  <option value="">Select correct answer...</option>
                  {q.options.map(
                    (opt, oIndex) =>
                      opt.trim() && (
                        <option key={oIndex} value={opt.trim()}>
                          {opt.trim()}
                        </option>
                      )
                  )}
                </select>
                {errors[`q_${qIndex}_answer`] && (
                  <div className="invalid-feedback">{errors[`q_${qIndex}_answer`]}</div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Button to dynamically append new questions fields */}
        <button
          type="button"
          className="btn btn-outline-secondary w-100 mb-4 py-2.5 fw-bold"
          onClick={addQuestion}
          style={{ borderRadius: '12px', border: '2px dashed var(--border)', color: 'var(--text-muted)' }}
        >
          ➕ Add Question
        </button>

        {/* Form action triggers for saving or discarding modifications */}
        <div className="d-flex gap-3">
          <button
            type="submit"
            className="btn-primary-custom flex-grow-1 py-2 fw-bold"
          >
            {isEditing ? 'Save Changes' : 'Create Exam'}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary py-2 fw-semibold px-4"
            onClick={onCancel}
            style={{ borderRadius: '10px', border: '1.5px solid var(--border)', color: 'var(--text)', background: 'var(--bg-card)' }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default ExamForm;

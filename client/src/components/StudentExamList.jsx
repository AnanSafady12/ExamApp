// Renders a grid listing published exams that are available for students to take
function StudentExamList({ exams, onStartExam }) {
  return (
    <div className="row g-4">
      {/* If there are no published exams, render an empty state block placeholder */}
      {exams.length === 0 ? (
        <div className="col-12 text-center py-5">
          <div className="card-premium mx-auto" style={{ maxWidth: '600px', padding: '40px' }}>
            <span style={{ fontSize: '3rem' }}>📭</span>
            <h3 className="mt-3 fw-bold" style={{ color: 'var(--text-h)' }}>No Exams Available</h3>
            <p className="text-muted" style={{ fontSize: '15px' }}>There are currently no active exams published for you to take. Please check back later.</p>
          </div>
        </div>
      ) : (
        /* Iterate and render published active exams cards */
        exams.map((exam) => (
          <div key={exam.id} className="col-md-6 col-lg-4">
            <div className="card-premium h-100 d-flex flex-column" style={{ padding: '24px' }}>
              <span className="badge-role badge-published mb-3 align-self-start">
                Published
              </span>
              <h4 className="fw-bold mb-2 flex-grow-1" style={{ color: 'var(--text-h)', fontSize: '1.25rem', textWrap: 'balance' }}>
                {exam.title}
              </h4>
              <p className="text-muted mb-4 small" style={{ fontSize: '13px' }}>
                📋 {exam.questions?.length || 0} Multiple-Choice Question{exam.questions?.length !== 1 && 's'}
              </p>
              <button
                className="btn-primary-custom w-100 fw-semibold py-2"
                onClick={() => onStartExam(exam)}
              >
                Start Exam
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default StudentExamList;

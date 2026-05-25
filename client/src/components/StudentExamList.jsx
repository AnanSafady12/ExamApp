function StudentExamList({ exams, onStartExam }) {
  return (
    <div className="row g-4">
      {exams.length === 0 ? (
        <div className="col-12 text-center py-5">
          <div className="search-container shadow-sm mx-auto" style={{ maxWidth: 600 }}>
            <span className="display-4">📭</span>
            <h4 className="mt-3 fw-bold">No Exams Available</h4>
            <p className="text-muted">There are currently no exams published for you to take.</p>
          </div>
        </div>
      ) : (
        exams.map((exam) => (
          <div key={exam.id} className="col-md-6 col-lg-4">
            <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
              <div className="card-body p-4 d-flex flex-column">
                <span className="badge bg-success-subtle text-success rounded-pill mb-2 px-3 py-2 align-self-start">
                  Active
                </span>
                <h4 className="card-title fw-bold mb-3">{exam.title}</h4>
                <p className="text-muted mb-4 flex-grow-1">
                  ❓ {exam.questions?.length || 0} Questions
                </p>
                <button
                  className="btn btn-primary w-100 rounded-pill py-2 fw-bold"
                  onClick={() => onStartExam(exam)}
                >
                  Start Exam
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default StudentExamList;

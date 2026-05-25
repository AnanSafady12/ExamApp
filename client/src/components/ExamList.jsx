import ExamCard from './ExamCard';

function ExamList({ exams, onViewScores, onEdit, onDelete }) {
  if (exams.length === 0) {
    return (
      <div className="text-center p-5 border rounded-4 bg-light">
        <span className="display-4">📭</span>
        <h4 className="fw-bold mt-3 text-muted">No exams available</h4>
      </div>
    );
  }

  return (
    <div className="row g-4">
      {exams.map((exam) => (
        <div className="col-md-4 col-sm-6" key={exam.id}>
          <ExamCard
            exam={exam}
            onViewScores={onViewScores}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
}

export default ExamList;

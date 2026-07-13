import ExamCard from './ExamCard';

// Renders a grid list containing individual ExamCard components
function ExamList({ exams, onViewScores, onEdit, onDelete, onStatusChange, onLiveMonitor, onExportCSV, unreadCounts }) {
  // If the exams list is empty, display a clean fallback placeholder card
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
      {/* Map through the exams list and render an ExamCard for each entry */}
      {exams.map((exam) => (
        <div className="col-md-4 col-sm-6" key={exam.id}>
          <ExamCard
            exam={exam}
            onViewScores={onViewScores}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            onLiveMonitor={onLiveMonitor}
            onExportCSV={onExportCSV}
            unreadCount={unreadCounts?.[exam.id] || 0}
          />
        </div>
      ))}
    </div>
  );
}

export default ExamList;

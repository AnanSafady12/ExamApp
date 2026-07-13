import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// Renders a data table representing student scores for a chosen exam, shown on the Teacher Dashboard
function ScoreTable({ selectedExamScores, scoresLoading, onClose, activeExam, onPublishResults }) {
  const [reviewSubmission, setReviewSubmission] = useState(null);

  // Compute Analytics Data
  const { gradeDistribution, itemAnalysis } = useMemo(() => {
    const grades = [
      { grade: 'A (90-100)', count: 0, color: '#4ade80' },
      { grade: 'B (80-89)', count: 0, color: '#60a5fa' },
      { grade: 'C (70-79)', count: 0, color: '#facc15' },
      { grade: 'D (60-69)', count: 0, color: '#fb923c' },
      { grade: 'F (<60)', count: 0, color: '#f87171' }
    ];

    const analysis = (activeExam?.questions || []).map((q, idx) => ({
      name: `Q${idx + 1}`,
      questionText: q.text,
      errors: 0,
      total: selectedExamScores?.scores?.length || 0
    }));

    if (selectedExamScores?.scores && activeExam?.questions) {
      selectedExamScores.scores.forEach(s => {
        // Compute Grades
        if (s.score >= 90) grades[0].count++;
        else if (s.score >= 80) grades[1].count++;
        else if (s.score >= 70) grades[2].count++;
        else if (s.score >= 60) grades[3].count++;
        else grades[4].count++;

        // Compute Item Errors
        if (s.answers) {
          (activeExam?.questions || []).forEach((q, idx) => {
            const studentAns = s.answers[q.id] || '';
            const correctAns = q.correctAnswer || '';
            const isCorrect = q.type === 'SHORT_ANSWER'
              ? studentAns.trim().toLowerCase() === correctAns.trim().toLowerCase()
              : studentAns === correctAns;
            
            if (!isCorrect) {
              analysis[idx].errors++;
            }
          });
        }
      });
    }
    return { gradeDistribution: grades, itemAnalysis: analysis };
  }, [selectedExamScores, activeExam]);

  // Hide the table entirely if no exam has been selected and no load is active
  if (!selectedExamScores && !scoresLoading) return null;

  const isPublished = activeExam?.resultsReleased;

  const handleExportCSV = () => {
    if (!selectedExamScores || !activeExam) return;
    const scores = selectedExamScores.scores;
    const headers = ['Student Name', 'Grade Score'];
    const csvContent = [
      headers.join(','),
      ...scores.map(s => `"${s.studentName}",${s.score}`)
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = activeExam.title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.setAttribute('download', `${safeTitle}_grades.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-overlay d-flex align-items-center justify-content-center" style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      zIndex: 1040,
      padding: '20px'
    }}>
      <div className="card-premium w-100 animate-in" style={{
        maxWidth: '1200px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '24px',
        background: 'var(--bg)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
        borderRadius: '16px'
      }}>
      {/* Table header containing the selected exam details and close buttons */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3 className="fw-bold mb-0" style={{ color: 'var(--text-h)', fontSize: '1.4rem' }}>
          Scores for Exam: {activeExam?.title || `Exam #${selectedExamScores?.examId}`}
        </h3>
        <div className="d-flex align-items-center gap-3">
          {activeExam && (
            isPublished ? (
              <span className="badge bg-success px-3 py-2 rounded-pill small">
                Results Published
              </span>
            ) : (
              <button
                className="btn btn-outline-success btn-sm rounded-pill px-3 py-1.5 fw-bold"
                onClick={() => onPublishResults(activeExam.id)}
              >
                📢 Publish Results
              </button>
            )
          )}
          {selectedExamScores?.scores?.length > 0 && (
            <button
              className="btn btn-outline-info btn-sm rounded-pill px-3 py-1.5 fw-bold"
              onClick={handleExportCSV}
            >
              ⬇️ Export CSV
            </button>
          )}
          <button
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
            style={{ transition: 'all 0.2s' }}
          />
        </div>
      </div>

      <div className="mt-2">
        {/* Render a simple spinner overlay while fetching the scores from API */}
        {scoresLoading ? (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm" role="status" style={{ color: 'var(--primary)' }} />
            <span className="ms-2 small text-muted">Fetching student scores…</span>
          </div>
        ) : selectedExamScores?.scores?.length === 0 ? (
          /* Displays clean warning if no students have taken the selected exam yet */
          <p className="text-muted text-center py-4 mb-0 small" style={{ fontSize: '14px' }}>
            No scores recorded for this exam yet.
          </p>
        ) : (
          <>
            <div className="row g-4 mt-1">
              {/* Left Column: Scores Table */}
              <div className="col-lg-6">
                <div className="card-premium h-100 border rounded-4" style={{ background: 'var(--bg-card)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                  <h5 className="fw-bold m-4 text-center">Detailed Scores</h5>
                  <div className="table-responsive">
                    <table className="table table-premium align-middle mb-0 w-100">
                      <thead>
                        <tr>
                          <th className="py-2 px-3">Student Name</th>
                          <th className="py-2 px-3 text-center">Grade Score</th>
                          <th className="py-2 px-3 text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(selectedExamScores?.scores || []).map((s, idx) => (
                          <tr key={idx}>
                            <td className="py-3 px-3 fw-bold" style={{ color: 'var(--text-h)', fontSize: '15px' }}>
                              {s.studentName}
                            </td>
                            <td className="py-3 px-3 text-center fw-bold" style={{ color: s.score >= (activeExam?.passingGrade || 60) ? 'var(--success)' : 'var(--danger)', fontSize: '15px' }}>
                              {s.score}%
                            </td>
                            <td className="py-3 px-3 text-end">
                              <button
                                className="btn btn-primary btn-sm rounded-pill px-3 py-1 fw-bold"
                                onClick={() => setReviewSubmission(s)}
                              >
                                🔍 Review
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Right Column: Analytics */}
              <div className="col-lg-6">
                <div className="d-flex flex-column gap-4 h-100">
                  <div className="card-premium p-4 border rounded-4 flex-grow-1" style={{ background: 'var(--bg-card)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <h5 className="fw-bold mb-4 text-center">Grade Distribution</h5>
                    <div style={{ height: '250px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={gradeDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                          <XAxis dataKey="grade" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <Tooltip 
                            cursor={{ fill: 'var(--hover-bg)' }}
                            contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-h)' }} 
                          />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={50}>
                            {gradeDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="card-premium p-4 border rounded-4 flex-grow-1" style={{ background: 'var(--bg-card)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <h5 className="fw-bold mb-4 text-center">Item Analysis (Error Rate)</h5>
                    <p className="text-center text-muted small mb-3">Questions most frequently answered incorrectly.</p>
                    <div style={{ height: '250px', width: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={itemAnalysis} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                          <XAxis type="number" allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                          <Tooltip 
                            cursor={{ fill: 'var(--hover-bg)' }}
                            formatter={(value) => [`${value} incorrect answers`, 'Errors']}
                            labelFormatter={(label, payload) => {
                              if (payload && payload.length > 0) {
                                return `${label}: ${payload[0].payload.questionText}`;
                              }
                              return label;
                            }}
                            contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-h)' }} 
                          />
                          <Bar dataKey="errors" fill="#818cf8" radius={[0, 6, 6, 0]} maxBarSize={30} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="mt-4 text-end">
        <button
          className="btn btn-secondary px-4 fw-bold rounded-pill"
          onClick={onClose}
        >
          Exit Dashboard
        </button>
      </div>

      {/* Review Submission Modal overlay */}
      {reviewSubmission && activeExam && (
        <div className="modal-overlay d-flex align-items-center justify-content-center" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1050,
          padding: '20px'
        }}>
          <div className="card-premium w-100 animate-in" style={{
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            border: 'none',
            borderRadius: '16px',
            background: 'var(--bg)'
          }}>
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-2">
              <div>
                <h4 className="fw-bold mb-1">Review Submission</h4>
                <p className="text-muted small mb-0">
                  Student: <strong>{reviewSubmission.studentName}</strong> | Score: <strong>{reviewSubmission.score}%</strong>
                </p>
              </div>
              <button
                type="button"
                className="btn-close"
                onClick={() => setReviewSubmission(null)}
                aria-label="Close"
              />
            </div>

            <div className="d-flex flex-column gap-3">
              {(activeExam?.questions || []).map((q, idx) => {
                const studentAns = reviewSubmission.answers[q.id] || '';
                const correctAns = q.correctAnswer || '';
                
                const isCorrect = q.type === 'SHORT_ANSWER'
                  ? studentAns.trim().toLowerCase() === correctAns.trim().toLowerCase()
                  : studentAns === correctAns;

                return (
                  <div key={q.id} className="p-3 border rounded-3 bg-light">
                    <p className="fw-bold mb-2">Q{idx + 1}: {q.text}</p>
                    <div className="small">
                      <p className={`mb-1 ${isCorrect ? 'text-success' : 'text-danger'}`}>
                        <strong>Student's Answer:</strong> {studentAns || '(No answer provided)'} {isCorrect ? '✓' : '✕'}
                      </p>
                      {!isCorrect && (
                        <p className="text-success mb-0">
                          <strong>Correct Answer:</strong> {correctAns}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 text-end">
              <button
                className="btn btn-secondary rounded-pill px-4 fw-bold"
                onClick={() => setReviewSubmission(null)}
              >
                Close Review
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

export default ScoreTable;

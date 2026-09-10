// HistoryPanel.jsx
// Displays recent email verification results
// Features:
// - Shows last 10 verification results
// - Color-coded badges for each result
// - Timestamp for each verification
// - Receives history from parent App component

import React from 'react';

export default function HistoryPanel({ history }) {
  const getResultColor = (result) => {
    switch (result) {
      case 'valid':
        return '#10b981'; // Green
      case 'invalid':
        return '#ef4444'; // Red
      case 'unknown':
        return '#f59e0b'; // Amber
      default:
        return '#6b7280'; // Gray
    }
  };

  return (
    <div className="history-panel">
      <h2>📜 Recent Verifications</h2>
      
      {history.length === 0 ? (
        <div className="empty-state">
          <p>No verification history yet.</p>
          <p className="hint">Verify emails to see results here</p>
        </div>
      ) : (
        <div className="history-list">
          {history.map((item, i) => (
            <div key={i} className="history-item">
              <div className="history-badge" style={{ backgroundColor: getResultColor(item.result) }}>
                {item.result === 'valid' ? '✓' : item.result === 'invalid' ? '✗' : '?'}
              </div>
              <div className="history-content">
                <div className="history-email">{item.email}</div>
                <div className="history-meta">
                  {item.domain && <span className="domain">{item.domain}</span>}
                  <span className="time">{new Date(item.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

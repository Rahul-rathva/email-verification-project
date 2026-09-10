// StatsDashboard.jsx
// Statistics dashboard component
// Features:
// - Display counts of valid/invalid/unknown emails
// - Simple pie chart representation
// - Percentage calculations
// - Real-time updates from server

import React from 'react';

export default function StatsDashboard({ stats }) {
  const total = stats.total || 0;

  const getPercentage = (count) => {
    if (total === 0) return 0;
    return ((count / total) * 100).toFixed(1);
  };

  const validPercentage = getPercentage(stats.valid);
  const invalidPercentage = getPercentage(stats.invalid);
  const unknownPercentage = getPercentage(stats.unknown);

  return (
    <div className="stats-dashboard">
      <h2>📊 Verification Statistics</h2>

      {total === 0 ? (
        <div className="empty-state">
          <p>No statistics yet.</p>
          <p className="hint">Start verifying emails to see statistics</p>
        </div>
      ) : (
        <>
          {/* Stats Boxes */}
          <div className="stats-grid">
            <div className="stat-box stat-valid">
              <div className="stat-number">{stats.valid}</div>
              <div className="stat-label">Valid</div>
              <div className="stat-percent">{validPercentage}%</div>
            </div>
            <div className="stat-box stat-invalid">
              <div className="stat-number">{stats.invalid}</div>
              <div className="stat-label">Invalid</div>
              <div className="stat-percent">{invalidPercentage}%</div>
            </div>
            <div className="stat-box stat-unknown">
              <div className="stat-number">{stats.unknown}</div>
              <div className="stat-label">Unknown</div>
              <div className="stat-percent">{unknownPercentage}%</div>
            </div>
          </div>

          {/* Total */}
          <div className="stats-total">
            <div className="total-label">Total Verifications</div>
            <div className="total-count">{total}</div>
          </div>

          {/* Simple Pie Chart */}
          <div className="stats-pie">
            <svg viewBox="0 0 100 100" className="pie-chart">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#10b981"
                strokeWidth="30"
                strokeDasharray={`${validPercentage * 2.827} 282.7`}
                transform="rotate(-90 50 50)"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#ef4444"
                strokeWidth="30"
                strokeDasharray={`${invalidPercentage * 2.827} 282.7`}
                strokeDashoffset={`-${validPercentage * 2.827}`}
                transform="rotate(-90 50 50)"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="30"
                strokeDasharray={`${unknownPercentage * 2.827} 282.7`}
                strokeDashoffset={`-${(validPercentage + invalidPercentage) * 2.827}`}
                transform="rotate(-90 50 50)"
              />
              <text x="50" y="50" textAnchor="middle" dy="0.3em" className="pie-text">
                {total}
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="stats-legend">
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#10b981' }}></div>
              <span>Valid ({stats.valid})</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#ef4444' }}></div>
              <span>Invalid ({stats.invalid})</span>
            </div>
            <div className="legend-item">
              <div className="legend-color" style={{ backgroundColor: '#f59e0b' }}></div>
              <span>Unknown ({stats.unknown})</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

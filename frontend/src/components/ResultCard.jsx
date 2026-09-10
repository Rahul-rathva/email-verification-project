// ResultCard.jsx
// Displays email verification result in a formatted card
// Features:
// - Colored badge: VALID (green), INVALID (red), UNKNOWN (yellow)
// - All result fields clearly displayed
// - MX record list with provider detection
// - Disposable domain warning
// - Typo suggestion with "Did You Mean?" feature
// - Execution time display

import React from 'react';

export default function ResultCard({ result }) {
  if (!result) return null;

  // Determine badge color and emoji
  const getBadgeStyle = () => {
    switch (result.result) {
      case 'valid':
        return { className: 'badge badge-valid', emoji: '✓' };
      case 'invalid':
        return { className: 'badge badge-invalid', emoji: '✗' };
      case 'unknown':
        return { className: 'badge badge-unknown', emoji: '?' };
      default:
        return { className: 'badge', emoji: '•' };
    }
  };

  const badge = getBadgeStyle();

  return (
    <div className="result-card">
      <div className={badge.className}>
        {badge.emoji} {result.result.toUpperCase()}
      </div>

      <div className="result-content">
        {/* Email Info */}
        <div className="result-section">
          <h3>📧 Email Information</h3>
          <div className="result-row">
            <span className="label">Email:</span>
            <span className="value">{result.email}</span>
          </div>
          <div className="result-row">
            <span className="label">Domain:</span>
            <span className="value">{result.domain}</span>
          </div>
        </div>

        {/* Verification Results */}
        <div className="result-section">
          <h3>🔍 Verification Result</h3>
          <div className="result-row">
            <span className="label">Result Code:</span>
            <span className="value">{result.resultcode} {result.resultcode === 1 ? '(Valid)' : result.resultcode === 3 ? '(Unknown)' : '(Invalid)'}</span>
          </div>
          <div className="result-row">
            <span className="label">Sub-result:</span>
            <span className="value">{result.subresult?.replace(/_/g, ' ') || 'N/A'}</span>
          </div>
        </div>

        {/* MX Records */}
        {result.mxRecords && result.mxRecords.length > 0 && (
          <div className="result-section">
            <h3>📬 Mail Servers (MX Records)</h3>
            <div className="mx-records">
              {result.emailProvider && (
                <div className="provider-badge">
                  {result.emailProvider.icon} {result.emailProvider.name}
                </div>
              )}
              <ul className="mx-list">
                {result.mxRecords.map((mx, i) => (
                  <li key={i}>{mx}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Warnings */}
        {result.disposable && (
          <div className="result-section warning">
            <h3>⚠️ Disposable Email Domain</h3>
            <p>This email address uses a temporary/disposable email service. It may not persist for email confirmations.</p>
          </div>
        )}

        {/* Typo Suggestion */}
        {result.didyoumean && (
          <div className="result-section suggestion">
            <h3>💡 Did You Mean?</h3>
            <p>
              Did you mean: <strong>{result.didyoumean.suggested}</strong>?
            </p>
            <p className="suggestion-confidence">Confidence: {result.didyoumean.confidence?.toFixed(0)}%</p>
          </div>
        )}

        {/* Error Details */}
        {result.error && (
          <div className="result-section error">
            <h3>⚠️ Error Details</h3>
            <p>{result.error}</p>
          </div>
        )}

        {/* Metadata */}
        <div className="result-section metadata">
          <div className="result-row">
            <span className="label">Execution Time:</span>
            <span className="value">{result.executiontime} second{result.executiontime !== 1 ? 's' : ''}</span>
          </div>
          <div className="result-row">
            <span className="label">Verified:</span>
            <span className="value">{new Date(result.timestamp).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

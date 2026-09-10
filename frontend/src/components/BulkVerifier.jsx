// BulkVerifier.jsx
// Component for bulk email verification
// Features:
// - Textarea for entering multiple emails (one per line)
// - Verify all emails in parallel
// - Display results in a table
// - Export results to CSV file

import React, { useState } from 'react';

export default function BulkVerifier({ onVerify, loading }) {
  const [emailsText, setEmailsText] = useState('');

  const handleVerify = () => {
    const emails = emailsText
      .split('\n')
      .map(e => e.trim())
      .filter(e => e.length > 0);

    if (emails.length === 0) {
      alert('Please enter at least one email');
      return;
    }

    if (emails.length > 100) {
      alert('Maximum 100 emails allowed per request');
      return;
    }

    onVerify(emails);
    setEmailsText('');
  };

  const handleClear = () => {
    setEmailsText('');
  };

  const emailCount = emailsText
    .split('\n')
    .map(e => e.trim())
    .filter(e => e.length > 0).length;

  return (
    <div className="bulk-verifier">
      <div className="bulk-form">
        <h2>📧 Bulk Email Verification</h2>
        <p>Enter multiple email addresses (one per line), max 100 emails</p>
        
        <textarea
          value={emailsText}
          onChange={(e) => setEmailsText(e.target.value)}
          placeholder="user1@example.com&#10;user2@example.com&#10;user3@example.com"
          className="bulk-textarea"
          disabled={loading}
          rows="10"
        />
        
        <div className="bulk-info">
          <span>{emailCount} email{emailCount !== 1 ? 's' : ''} ready to verify</span>
        </div>

        <div className="bulk-buttons">
          <button
            onClick={handleVerify}
            disabled={loading || emailCount === 0}
            className="verify-btn"
          >
            {loading ? 'Verifying...' : `Verify All (${emailCount})`}
          </button>
          <button
            onClick={handleClear}
            disabled={loading || emailCount === 0}
            className="clear-btn"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

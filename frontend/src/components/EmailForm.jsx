// EmailForm.jsx
// Single email verification form component
// Features:
// - Email input field
// - Submit button with loading state
// - Error messages
// - Integrates with parent App component

import React, { useState } from 'react';

export default function EmailForm({ onVerify, loading }) {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      alert('Please enter an email address');
      return;
    }
    onVerify(email.trim());
    setEmail('');
  };

  return (
    <div className="email-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email to verify (e.g., user@example.com)"
            className="email-input"
            disabled={loading}
            autoFocus
          />
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </div>
      </form>
      <p className="form-hint">✓ Validates format • ✓ Checks DNS MX records • ✓ SMTP verification</p>
    </div>
  );
}

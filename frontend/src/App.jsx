// App.jsx
// Main React component for Email Verification Module
// Features:
// - Single email verification form
// - Result display card with color badges
// - Recent verification history (last 10)
// - Bulk verification mode (multiple emails)
// - Statistics dashboard with pie chart
// - Dark mode toggle
// - Responsive design

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EmailForm from './components/EmailForm';
import ResultCard from './components/ResultCard';
import HistoryPanel from './components/HistoryPanel';
import BulkVerifier from './components/BulkVerifier';
import StatsDashboard from './components/StatsDashboard';
import './App.css';

const API_BASE = 'http://localhost:5000/api';

export default function App() {
  const [currentResult, setCurrentResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ valid: 0, invalid: 0, unknown: 0, total: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  // Apply dark mode
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Fetch history and stats on mount
  useEffect(() => {
    fetchHistory();
    fetchStats();
    const interval = setInterval(() => {
      fetchHistory();
      fetchStats();
    }, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE}/history?limit=10`);
      setHistory(response.data.results);
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE}/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleVerifyEmail = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/verify`, { email });
      setCurrentResult(response.data);
      await fetchHistory();
      await fetchStats();
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkVerify = async (emails) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${API_BASE}/bulk`, { emails });
      setCurrentResult(null);
      await fetchHistory();
      await fetchStats();
      alert(`Bulk verification complete! ${response.data.count} emails verified.`);
    } catch (err) {
      setError(err.response?.data?.error || 'Bulk verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>📧 Email Verification Module</h1>
          <p>Verify email addresses with SMTP validation and typo detection</p>
        </div>
        <button
          className="dark-mode-toggle"
          onClick={() => setDarkMode(!darkMode)}
          title={darkMode ? 'Light mode' : 'Dark mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </header>

      <main className="app-main">
        <div className="container">
          {/* Mode Toggle */}
          <div className="mode-toggle">
            <button
              className={`mode-btn ${!bulkMode ? 'active' : ''}`}
              onClick={() => setBulkMode(false)}
            >
              Single Email
            </button>
            <button
              className={`mode-btn ${bulkMode ? 'active' : ''}`}
              onClick={() => setBulkMode(true)}
            >
              Bulk Verify
            </button>
          </div>

          {/* Error Display */}
          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Verifying...</p>
            </div>
          )}

          {/* Single Email Mode */}
          {!bulkMode && (
            <div className="single-mode">
              <EmailForm onVerify={handleVerifyEmail} loading={loading} />
              {currentResult && <ResultCard result={currentResult} />}
            </div>
          )}

          {/* Bulk Mode */}
          {bulkMode && (
            <BulkVerifier onVerify={handleBulkVerify} loading={loading} />
          )}

          {/* Two-column layout for history and stats */}
          <div className="sidebar-section">
            <div className="sidebar-column">
              <HistoryPanel history={history} />
            </div>
            <div className="sidebar-column">
              <StatsDashboard stats={stats} />
            </div>
          </div>
        </div>
      </main>

      <footer className="app-footer">
        <p>Built with React, Express, MongoDB | Powered by advanced email verification</p>
      </footer>
    </div>
  );
}

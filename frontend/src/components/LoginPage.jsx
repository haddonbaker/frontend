/**
 * LoginPage.jsx
 * Description: Login page shown on app startup. Supports placeholder login form
 * and a "continue without logging in" (guest) option.
 */

import React, { useState } from 'react';
import { UserCircle } from 'lucide-react';

export default function LoginPage({ onLogin, onContinueAsGuest }) {
  const [username, setUsername] = useState('');
  const [major, setMajor] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Placeholder — login endpoint not yet implemented
    if (username.trim()) {
      onLogin({ name: username.trim(), major: major.trim() || 'Undeclared' });
    }
  };

  const cardStyle = {
    background: 'var(--bg-panel)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '2.5rem 2rem',
    width: '100%',
    maxWidth: '380px',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.6rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-subtle)',
    color: 'var(--text-primary)',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const labelStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    fontSize: '0.85rem',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  };

  const primaryBtnStyle = {
    width: '100%',
    padding: '0.65rem',
    borderRadius: '6px',
    border: 'none',
    background: 'var(--primary-color)',
    color: '#fff',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
  };

  const ghostBtnStyle = {
    width: '100%',
    padding: '0.6rem',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
    cursor: 'pointer',
    fontFamily: 'inherit',
  };

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-page)',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={cardStyle}>
        {/* Logo / title */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <UserCircle size={40} style={{ color: 'var(--primary-color)' }} />
          <h1 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-title)' }}>
            GCC Course Scheduler
          </h1>
          <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <label style={labelStyle}>
            Username
            <input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              style={inputStyle}
              autoFocus
            />
          </label>

          <label style={labelStyle}>
            Password
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={inputStyle}
            />
          </label>

          <label style={labelStyle}>
            Major
            <input
              type="text"
              placeholder="Enter your major"
              value={major}
              onChange={e => setMajor(e.target.value)}
              style={inputStyle}
            />
          </label>

          <button type="submit" style={primaryBtnStyle}>
            Log In
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        <button onClick={onContinueAsGuest} style={ghostBtnStyle}>
          Continue without logging in
        </button>
      </div>
    </div>
  );
}

/**
 * LoginPage.jsx
 * Description: Login/sign-up page shown on app startup. Supports creating a new account
 * or signing in to an existing one, plus a "continue without logging in" guest option.
 */

import React, { useState } from 'react';
import { UserCircle } from 'lucide-react';
import * as api from '../apiService';
import MajorSelectionModal from './MajorSelectionModal';

export default function LoginPage({ onLogin, onContinueAsGuest }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // After a successful auth, hold the user here until the popup is dismissed
  const [pendingUser, setPendingUser] = useState(null);

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Username and password are required.');
      return;
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const data = mode === 'login'
        ? await api.login(username.trim(), password)
        : await api.createAccount(username.trim(), password);
      if (mode === 'signup') {
        setPendingUser({ name: data.username });
      } else {
        onLogin({ name: data.username, major: data.major || '' });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
    background: loading ? 'var(--bg-subtle)' : 'var(--primary-color)',
    color: loading ? 'var(--text-muted)' : '#fff',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: loading ? 'not-allowed' : 'pointer',
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

  const switchLinkStyle = {
    background: 'none',
    border: 'none',
    padding: 0,
    color: 'var(--primary-color)',
    fontWeight: 600,
    fontSize: 'inherit',
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
            {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
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
              disabled={loading}
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
              disabled={loading}
            />
          </label>

          {mode === 'signup' && (
            <label style={labelStyle}>
              Confirm Password
              <input
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                style={inputStyle}
                disabled={loading}
              />
            </label>
          )}

          {error && (
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--error-text)', background: 'var(--error-bg)', padding: '0.5rem 0.7rem', borderRadius: '6px' }}>
              {error}
            </p>
          )}

          <button type="submit" style={primaryBtnStyle} disabled={loading}>
            {loading ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Account'}
          </button>
        </form>

        {/* Switch between login and sign-up */}
        <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
          {mode === 'login' ? (
            <>Don't have an account?{' '}
              <button style={switchLinkStyle} onClick={() => switchMode('signup')}>Sign up</button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button style={switchLinkStyle} onClick={() => switchMode('login')}>Log in</button>
            </>
          )}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        <button onClick={onContinueAsGuest} style={ghostBtnStyle} disabled={loading}>
          Continue without logging in
        </button>
      </div>

      {/* Major selection — shown automatically after sign-up */}
      <MajorSelectionModal
        isOpen={!!pendingUser}
        onClose={() => onLogin(pendingUser, false)}
        onSelectMajor={(major) => onLogin({ ...pendingUser, major }, true)}
      />
    </div>
  );
}

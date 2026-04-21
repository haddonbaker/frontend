/**
 * EditDisplayNameModal.jsx
 * Description: Modal for editing the user's display name.
 */

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function EditDisplayNameModal({ isOpen, onClose, currentDisplayName, onUpdateDisplayName }) {
  const [displayName, setDisplayName] = useState(currentDisplayName || '');

  useEffect(() => {
    if (isOpen) {
      setDisplayName(currentDisplayName || '');
    }
  }, [isOpen, currentDisplayName]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedDisplayName = displayName.trim();
    if (trimmedDisplayName) {
      console.log('EditDisplayNameModal submitting:', trimmedDisplayName);
      onUpdateDisplayName(trimmedDisplayName);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Edit display name</h2>
          <button style={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} style={styles.content}>
          <p style={styles.description}>
            Choose a display name that will be shown throughout the application.
          </p>
          <label style={styles.label}>
            <input
              type="text"
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              style={styles.input}
              placeholder="Enter your display name"
              autoFocus
            />
          </label>
          <div style={styles.actions}>
            <button type="button" onClick={onClose} style={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" style={styles.saveButton} disabled={!displayName.trim()}>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15, 23, 42, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'var(--bg-panel)',
    borderRadius: '16px',
    width: '90vw',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--border-color)',
  },
  title: {
    margin: 0,
    fontSize: '1.25rem',
    fontWeight: 700,
    color: 'var(--text-title)',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    padding: '0.25rem',
  },
  content: {
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  description: {
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
  input: {
    padding: '0.75rem',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    fontSize: '0.9rem',
    background: 'var(--bg-subtle)',
    color: 'var(--text-primary)',
    outline: 'none',
  },
  actions: {
    display: 'flex',
    gap: '0.75rem',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    padding: '0.6rem 1rem',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    background: 'var(--bg-panel)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  saveButton: {
    padding: '0.6rem 1rem',
    border: 'none',
    borderRadius: '8px',
    background: 'var(--primary-color)',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 600,
  },
};
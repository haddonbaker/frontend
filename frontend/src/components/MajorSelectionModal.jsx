/**
 * MajorSelectionModal.jsx
 * Description: Modal for selecting a major from the available list.
 */

import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { CATEGORY_MAP, formatDisplayName } from '../sheetData';

const getMajorsList = () => {
  return Object.keys(CATEGORY_MAP).map(major => ({
    key: major,
    displayName: formatDisplayName(major),
    category: CATEGORY_MAP[major],
  })).sort((a, b) => a.displayName.localeCompare(b.displayName));
};

export default function MajorSelectionModal({ isOpen, onClose, onSelectMajor }) {
  if (!isOpen) return null;

  const majors = getMajorsList();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>Select your major</h2>
          <button style={styles.closeButton} onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div style={styles.content}>
          <p style={styles.description}>
            Choose your major to see relevant status sheets and information.
          </p>
          <div style={styles.grid}>
            {majors.map(major => (
              <button
                key={major.key}
                style={styles.majorButton}
                onClick={() => {
                  onSelectMajor(major.displayName);
                  onClose();
                }}
              >
                <div style={styles.majorName}>{major.displayName}</div>
                <div style={styles.majorCategory}>{major.category}</div>
              </button>
            ))}
          </div>
        </div>
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
    maxWidth: '600px',
    maxHeight: '80vh',
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
    overflowY: 'auto',
  },
  description: {
    margin: '0 0 1rem',
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '0.75rem',
  },
  majorButton: {
    padding: '1rem',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    background: 'var(--bg-page)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.2s',
  },
  majorName: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: 'var(--text-title)',
    marginBottom: '0.25rem',
  },
  majorCategory: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
};
/**
 * Profile.jsx
 * Description: Displays the logged-in user's profile, major, and the most relevant status sheet.
 */

import React, { useMemo, useState, useEffect } from 'react';
import { allSheets } from '../sheetData';
import { FileText, Download, Eye, ArrowLeft, X, Maximize2, Minimize2 } from 'lucide-react';
import MajorSelectionModal from './MajorSelectionModal';

const normalizeMajor = (value) => {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .trim();
};

const findMajorSheets = (major) => {
  const normalizedMajor = normalizeMajor(major);
  if (!normalizedMajor) return [];

  return allSheets.filter((sheet) => {
    const normalizedSheet = normalizeMajor(sheet.displayName);
    return normalizedSheet.includes(normalizedMajor);
  });
};

export default function Profile({ user = {}, onBack = () => {}, onSelectMajor = () => {} }) {
  const major = user.major?.trim() || 'Undeclared';
  const name = user.name || 'Guest';
  const [showModal, setShowModal] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewName, setPreviewName] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const majorSheets = useMemo(() => findMajorSheets(major), [major]);
  const primarySheet = majorSheets[0] || null;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && previewUrl) {
        setPreviewUrl(null);
        setPreviewName('');
        setIsFullscreen(false);
      }
    };

    if (previewUrl) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [previewUrl]);

  return (
    <div style={styles.page}>
      <div style={styles.headerRow}>
        <button onClick={onBack} style={styles.backButton}>
          <ArrowLeft size={16} /> Back
        </button>
        <div>
          <h1 style={styles.title}>Your student profile</h1>
          <p style={styles.subtitle}>A quick view of your user details and your major status sheet.</p>
        </div>
      </div>

      <section style={styles.profileCard}>
        <div>
          <p style={styles.sectionLabel}>Name</p>
          <p style={styles.sectionValue}>{name}</p>
        </div>
        <div>
          <p style={styles.sectionLabel}>Major</p>
          <div style={styles.majorRow}>
            <p style={styles.sectionValue}>{major}</p>
            <button
              type="button"
              style={major.toLowerCase() === 'undeclared' ? styles.selectMajorButton : styles.changeMajorButton}
              onClick={() => setShowModal(true)}
            >
              {major.toLowerCase() === 'undeclared' ? 'Select major' : 'Edit'}
            </button>
          </div>
        </div>
        <div>
          <p style={styles.sectionLabel}>Status Sheet</p>
          <p style={styles.sectionValue}>{primarySheet ? primarySheet.displayName : 'No major status sheet found'}</p>
        </div>
      </section>

      <section style={styles.sheetSection}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Your Major Status Sheet</h2>
            <p style={styles.sectionDescription}>
              These are the most relevant documents for your declared major.
            </p>
          </div>
        </div>

        {primarySheet ? (
          <div style={styles.sheetCard}>
            <div style={styles.sheetCardBody}>
              <FileText size={28} color="#3B82F6" />
              <div style={styles.sheetText}>
                <p style={styles.sheetTitle}>{primarySheet.displayName}</p>
                <p style={styles.sheetMeta}>Major status sheet for {major}</p>
              </div>
            </div>
            <div style={styles.sheetActions}>
              <button
                style={styles.sheetActionButton}
                onClick={() => { setPreviewUrl(primarySheet.url); setPreviewName(primarySheet.displayName); }}
              >
                <Eye size={14} /> View
              </button>
              <a href={primarySheet.url} download={primarySheet.filename} style={{ ...styles.sheetActionButton, ...styles.downloadButton }}>
                <Download size={14} /> Download
              </a>
            </div>
          </div>
        ) : (
          <div style={styles.emptyState}>
            <p style={{ margin: 0 }}>We couldn't find a status sheet for this major. Try updating your major or browse all status sheets.</p>
          </div>
        )}
      </section>

      {/* PDF Preview Modal */}
      {previewUrl && (
        <div style={styles.modalOverlay} onClick={() => setPreviewUrl(null)}>
          <div style={{ ...styles.modal, ...(isFullscreen ? styles.modalFullscreen : {}) }} onClick={e => e.stopPropagation()}>
            {isFullscreen ? (
              <div style={styles.fullscreenBar}>
                <button style={styles.modalClose} onClick={() => setIsFullscreen(false)} title="Exit fullscreen">
                  <Minimize2 size={16} />
                </button>
              </div>
            ) : (
              <div style={styles.modalHeader}>
                <span style={styles.modalTitle}>{previewName}</span>
                <div style={styles.modalActions}>
                  <button style={styles.modalClose} onClick={() => setIsFullscreen(true)} title="Fullscreen">
                    <Maximize2 size={18} />
                  </button>
                  <button style={styles.modalClose} onClick={() => setPreviewUrl(null)}>
                    <X size={18} />
                  </button>
                </div>
              </div>
            )}
            <iframe
              src={previewUrl}
              style={styles.iframe}
              title={previewName}
            />
          </div>
        </div>
      )}

      <MajorSelectionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSelectMajor={onSelectMajor}
      />
    </div>
  );
}

const styles = {
  page: {
    padding: '1.5rem 2rem',
    minHeight: '100vh',
    background: 'var(--bg-page)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    background: 'var(--bg-panel)',
    padding: '0.6rem 0.9rem',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
  },
  title: {
    margin: 0,
    fontSize: '1.8rem',
    fontWeight: 700,
    color: 'var(--text-title)',
  },
  subtitle: {
    margin: '0.25rem 0 0',
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
  },
  profileCard: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
    padding: '1.25rem',
    background: 'var(--bg-panel)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
  },
  sectionLabel: {
    margin: 0,
    fontSize: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    color: 'var(--text-muted)',
  },
  sectionValue: {
    margin: '0.35rem 0 0',
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-title)',
  },
  majorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  selectMajorButton: {
    borderRadius: '8px',
    border: 'none',
    background: '#dc2626',
    color: '#fff',
    padding: '0.5rem 0.85rem',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  changeMajorButton: {
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-panel)',
    color: 'var(--text-primary)',
    padding: '0.5rem 0.85rem',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '0.85rem',
  },
  sheetSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  sectionHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  },
  sectionTitle: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: 700,
    color: 'var(--text-title)',
  },
  sectionDescription: {
    margin: 0,
    color: 'var(--text-secondary)',
    fontSize: '0.9rem',
  },
  sheetCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem 1.25rem',
    borderRadius: '16px',
    background: 'var(--bg-panel)',
    border: '1px solid var(--border-color)',
  },
  sheetCardBody: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    minWidth: 0,
  },
  sheetText: {
    minWidth: 0,
  },
  sheetTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--text-title)',
  },
  sheetMeta: {
    margin: '0.25rem 0 0',
    color: 'var(--text-secondary)',
    fontSize: '0.85rem',
  },
  sheetActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  sheetActionButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.4rem',
    borderRadius: '8px',
    border: '1px solid var(--border-color)',
    padding: '0.55rem 0.85rem',
    background: 'var(--bg-page)',
    color: 'var(--text-primary)',
    textDecoration: 'none',
    fontSize: '0.9rem',
  },
  downloadButton: {
    background: 'var(--bg-active-tab)',
    color: '#fff',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '1rem',
  },
  smallCard: {
    padding: '1rem',
    borderRadius: '14px',
    border: '1px solid var(--border-color)',
    background: 'var(--bg-panel)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  smallCardBody: {
    display: 'flex',
    gap: '0.9rem',
    alignItems: 'center',
  },
  smallCardTitle: {
    margin: 0,
    fontSize: '0.95rem',
    fontWeight: 600,
    color: 'var(--text-title)',
  },
  smallCardMeta: {
    margin: '0.35rem 0 0',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
  },
  smallCardActions: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
  },
  smallAction: {
    textDecoration: 'none',
    color: 'var(--primary-color)',
    fontSize: '0.85rem',
    fontWeight: 600,
  },
  emptyState: {
    padding: '1rem',
    borderRadius: '14px',
    border: '1px dashed var(--border-color)',
    background: 'var(--bg-panel)',
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
  },
  // Modal
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: 'var(--bg-panel)',
    borderRadius: '12px',
    width: '85vw',
    height: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  },
  modalFullscreen: {
    width: '100vw',
    height: '100vh',
    borderRadius: 0,
  },
  fullscreenBar: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: '0.2rem 0.5rem',
    borderBottom: '1px solid var(--border-subtle)',
    flexShrink: 0,
    background: 'var(--bg-panel)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.9rem 1.25rem',
    borderBottom: '1px solid var(--border-subtle)',
    flexShrink: 0,
  },
  modalTitle: {
    fontWeight: 600,
    fontSize: '0.95rem',
    color: 'var(--text-title)',
  },
  modalActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  modalClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'center',
    padding: '0.25rem',
  },
  iframe: {
    flex: 1,
    border: 'none',
    width: '100%',
  },
};
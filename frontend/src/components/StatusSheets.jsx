/**
 * StatusSheets.jsx
 * Description: Displays a searchable grid of major status sheets (PDFs) that users can view or download.
 */
import { useState, useMemo, useEffect, useRef } from 'react';
import { Search, FileText, Download, Eye, X, Maximize2, Minimize2 } from 'lucide-react';
import { allSheets, CATEGORIES } from '../sheetData';

export default function StatusSheets({ selectedSheet = '' }) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewName, setPreviewName] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const selectedCardRef = useRef(null);

  useEffect(() => {
    if (selectedSheet && selectedCardRef.current) {
      selectedCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedSheet]);

  const filtered = useMemo(() => {
    return allSheets.filter(sheet => {
      const matchesSearch = sheet.displayName.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || sheet.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

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
      {/* Header / Controls */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Status Sheets</h1>
          <p style={styles.subtitle}>2025–2026 Academic Year · {allSheets.length} documents</p>
        </div>

        <div style={styles.searchRow}>
          <div style={styles.searchWrapper}>
            <Search size={16} color="#94A3B8" style={styles.searchIcon} />
            <input
              style={styles.searchInput}
              placeholder="Search majors..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button style={styles.clearBtn} onClick={() => setSearch('')}>
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        <div style={styles.tabs}>
          {['All', ...CATEGORIES].map(cat => {
            const count = cat === 'All' ? allSheets.length : allSheets.filter(s => s.category === cat).length;
            return (
              <button
                key={cat}
                style={{ ...styles.tab, ...(activeCategory === cat ? styles.tabActive : {}) }}
                onClick={() => setActiveCategory(cat)}
              >
                {cat} <span style={styles.tabCount}>{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <div style={styles.grid}>
        {filtered.length === 0 ? (
          <div style={styles.empty}>No status sheets match your search.</div>
        ) : (
          filtered.map(sheet => (
            <div
              key={sheet.filename}
              ref={sheet.filename === selectedSheet ? selectedCardRef : null}
              style={{
                ...styles.card,
                ...(sheet.filename === selectedSheet ? styles.cardSelected : {}),
              }}
            >
              <FileText size={28} color="#3B82F6" style={{ flexShrink: 0, marginTop: '0.05rem' }} />
              <div style={styles.cardBody}>
                <p style={styles.cardName}>{sheet.displayName}</p>
              </div>
              <div style={styles.cardActions}>
                <button
                  style={styles.viewBtn}
                  onClick={() => { setPreviewUrl(sheet.url); setPreviewName(sheet.displayName); }}
                  title="View"
                >
                  <Eye size={15} />
                </button>
                <a
                  href={sheet.url}
                  download={sheet.filename}
                  style={styles.downloadBtn}
                  title="Download"
                >
                  <Download size={15} />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

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
    </div>
  );
}

const styles = {
  page: {
    padding: '1.5rem 2rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    background: 'var(--bg-page)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  title: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 700,
    color: 'var(--text-title)',
  },
  subtitle: {
    margin: 0,
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
  },
  searchRow: {
    display: 'flex',
    gap: '0.75rem',
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: '0 0 320px',
  },
  searchIcon: {
    position: 'absolute',
    left: '0.65rem',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    padding: '0.5rem 2rem 0.5rem 2.1rem',
    border: '1px solid var(--border-subtle)',
    borderRadius: '8px',
    fontSize: '0.875rem',
    background: 'var(--bg-panel)',
    outline: 'none',
    color: 'var(--text-title)',
  },
  clearBtn: {
    position: 'absolute',
    right: '0.5rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
  },
  tabs: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap',
  },
  tab: {
    padding: '0.35rem 0.75rem',
    borderRadius: '999px',
    border: '1px solid var(--border-subtle)',
    background: 'var(--bg-panel)',
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
  },
  tabActive: {
    background: '#3B82F6',
    borderColor: '#3B82F6',
    color: '#fff',
  },
  tabCount: {
    fontSize: '0.7rem',
    opacity: 0.75,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '0.75rem',
  },
  card: {
    background: 'var(--bg-panel)',
    border: '1px solid var(--border-subtle)',
    borderRadius: '10px',
    padding: '0.9rem 1rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    transition: 'box-shadow 0.15s',
  },
  cardSelected: {
    background: 'var(--bg-card-blue)',
    border: '2px solid var(--primary-color)',
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardName: {
    margin: 0,
    fontSize: '0.875rem',
    fontWeight: 600,
    color: 'var(--text-title)',
    lineHeight: 1.4,
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  },
  cardCategory: {
    margin: '0.15rem 0 0',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  cardActions: {
    display: 'flex',
    gap: '0.4rem',
    flexShrink: 0,
  },
  viewBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.4rem',
    border: '1px solid var(--border-subtle)',
    borderRadius: '6px',
    background: 'var(--bg-page)',
    color: '#3B82F6',
    cursor: 'pointer',
  },
  downloadBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.4rem',
    border: '1px solid var(--border-subtle)',
    borderRadius: '6px',
    background: 'var(--bg-page)',
    color: '#10B981',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  empty: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    color: 'var(--text-muted)',
    padding: '3rem',
    fontSize: '0.9rem',
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
  modalDownload: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem',
    fontSize: '0.85rem',
    color: '#3B82F6',
    textDecoration: 'none',
    padding: '0.35rem 0.75rem',
    border: '1px solid var(--border-subtle)',
    borderRadius: '6px',
    background: 'var(--bg-active-tab)',
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

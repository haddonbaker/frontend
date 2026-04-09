/**
 * StatusSheets.jsx
 * Description: Displays a searchable grid of major status sheets (PDFs) that users can view or download.
 */
import { useState, useMemo } from 'react';
import { Search, FileText, Download, Eye, X } from 'lucide-react';

// Load all PDFs from the data folder as URLs
const pdfModules = import.meta.glob('../data/2025-2026 Files/*.pdf', { query: '?url', import: 'default', eager: true });

function formatDisplayName(filename) {
  // Remove extension and trailing year suffix (_2029, _2526, etc.)
  let name = filename.replace('.pdf', '').replace(/_\d{4}$/, '');
  // Split by underscore into parts (major, concentration, etc.)
  const parts = name.split('_');
  // Insert spaces before uppercase letters preceded by lowercase (PascalCase splitting)
  return parts.map(part => part.replace(/([a-z])([A-Z])/g, '$1 $2')).join(' · ');
}

const CATEGORY_MAP = {
  Accounting: 'Business',
  AppliedScienceandEngineering: 'Engineering & CS',
  AppliedStatistics: 'Sciences & Math',
  BiblicalandTheologicalStudies: 'Theology',
  Biochemistry: 'Sciences & Math',
  Biology: 'Sciences & Math',
  BiologyHealth: 'Sciences & Math',
  BusinessAnalysis: 'Business',
  BusinessEconomics: 'Business',
  BusinessStatistics: 'Business',
  Chemistry: 'Sciences & Math',
  CommunicationArts: 'Arts & Humanities',
  ComputerEngineering: 'Engineering & CS',
  ComputerProgramming: 'Engineering & CS',
  ComputerScience: 'Engineering & CS',
  ConservationBiology: 'Sciences & Math',
  DataScience: 'Engineering & CS',
  DesignandInnovation: 'Engineering & CS',
  Economics: 'Business',
  ElectricalEngineering: 'Engineering & CS',
  ElementaryEduc: 'Education',
  English: 'Arts & Humanities',
  Entrepreneurship: 'Business',
  ExerciseScience: 'Sciences & Math',
  Finance: 'Business',
  French: 'Arts & Humanities',
  History: 'Arts & Humanities',
  HumanResourceManagement: 'Business',
  InternationalBusiness: 'Business',
  Management: 'Business',
  Marketing: 'Business',
  Mathematics: 'Sciences & Math',
  MechanicalEngineering: 'Engineering & CS',
  MiddleLevel: 'Education',
  MolecularBiology: 'Sciences & Math',
  Music: 'Music',
  MusicBusiness: 'Music',
  MusicPerformance: 'Music',
  MusicReligion: 'Music',
  Nursing: 'Nursing',
  Philosophy: 'Arts & Humanities',
  Physics: 'Sciences & Math',
  PoliticalScience: 'Social Sciences',
  Psychology: 'Social Sciences',
  SocialWork: 'Social Sciences',
  Spanish: 'Arts & Humanities',
  SpecialEducation: 'Education',
  SpecialEducwithElementaryEduc: 'Education',
  SupplyChainManagement: 'Business',
  Undeclared: 'Undeclared',
};

const CATEGORIES = ['Arts & Humanities', 'Business', 'Education', 'Engineering & CS', 'Music', 'Nursing', 'Sciences & Math', 'Social Sciences', 'Theology', 'Undeclared'];

function getMajorCategory(filename) {
  const base = filename.replace('.pdf', '').split('_')[0];
  return CATEGORY_MAP[base] || 'Other';
}

function isMajorSheet(filename) {
  if (filename.includes('Guidelines') || filename.includes('IB ') || filename.includes('AP ') || filename.includes('CLEP') || filename.includes('Cambridge')) return false;
  if (filename.startsWith('Minors')) return false;
  return true;
}

// Build a sorted list of major status sheet PDFs only
const allSheets = Object.entries(pdfModules)
  .filter(([path]) => isMajorSheet(path.split('/').pop()))
  .map(([path, url]) => {
    const filename = path.split('/').pop();
    return { filename, url, displayName: formatDisplayName(filename), category: getMajorCategory(filename) };
  })
  .sort((a, b) => a.displayName.localeCompare(b.displayName));

export default function StatusSheets() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewName, setPreviewName] = useState('');

  const filtered = useMemo(() => {
    return allSheets.filter(sheet => {
      const matchesSearch = sheet.displayName.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'All' || sheet.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

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
            <div key={sheet.filename} style={styles.card}>
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
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={styles.modalTitle}>{previewName}</span>
              <div style={styles.modalActions}>
                <a href={previewUrl} download style={styles.modalDownload}>
                  <Download size={16} /> Download
                </a>
                <button style={styles.modalClose} onClick={() => setPreviewUrl(null)}>
                  <X size={18} />
                </button>
              </div>
            </div>
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
    background: '#F8FAFC',
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
    color: '#1E293B',
  },
  subtitle: {
    margin: 0,
    fontSize: '0.85rem',
    color: '#64748B',
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
    border: '1px solid #E2E8F0',
    borderRadius: '8px',
    fontSize: '0.875rem',
    background: '#fff',
    outline: 'none',
    color: '#1E293B',
  },
  clearBtn: {
    position: 'absolute',
    right: '0.5rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#94A3B8',
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
    border: '1px solid #E2E8F0',
    background: '#fff',
    fontSize: '0.8rem',
    color: '#475569',
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
    background: '#fff',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '0.9rem 1rem',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    transition: 'box-shadow 0.15s',
  },
  cardBody: {
    flex: 1,
    minWidth: 0,
  },
  cardName: {
    margin: 0,
    fontSize: '0.875rem',
    fontWeight: 600,
    color: '#1E293B',
    lineHeight: 1.4,
  },
  cardCategory: {
    margin: '0.15rem 0 0',
    fontSize: '0.75rem',
    color: '#94A3B8',
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
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    background: '#F8FAFC',
    color: '#3B82F6',
    cursor: 'pointer',
  },
  downloadBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.4rem',
    border: '1px solid #E2E8F0',
    borderRadius: '6px',
    background: '#F8FAFC',
    color: '#10B981',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  empty: {
    gridColumn: '1 / -1',
    textAlign: 'center',
    color: '#94A3B8',
    padding: '3rem',
    fontSize: '0.9rem',
  },
  // Modal
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(15,23,42,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    background: '#fff',
    borderRadius: '12px',
    width: '85vw',
    height: '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.9rem 1.25rem',
    borderBottom: '1px solid #E2E8F0',
    flexShrink: 0,
  },
  modalTitle: {
    fontWeight: 600,
    fontSize: '0.95rem',
    color: '#1E293B',
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
    border: '1px solid #BFDBFE',
    borderRadius: '6px',
    background: '#EFF6FF',
  },
  modalClose: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#64748B',
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

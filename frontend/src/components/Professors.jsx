import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import * as api from '../apiService';

//The styling here was done with help from AI.
//The rest was written without help.
//This is just a personal note to document my AI usage

// Renders partially-filled stars via CSS clip overlay for a 0–5 rating with color coding
function StarRating({ rating }) {
  if (rating == null) return <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>N/A</span>;
  const r = Math.max(0, Math.min(5, parseFloat(rating)));
  const color = r >= 4 ? 'var(--success-text)' : r >= 3 ? '#F59E0B' : 'var(--error-text)';
  const pct = (r / 5) * 100;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', whiteSpace: 'nowrap' }}>
      <span style={{ position: 'relative', display: 'inline-block', letterSpacing: '0.05em' }}>
        <span style={{ color: 'var(--text-muted)' }}>☆☆☆☆☆</span>
        <span style={{
          position: 'absolute', top: 0, left: 0,
          overflow: 'hidden', width: `${pct}%`,
          color, whiteSpace: 'nowrap', letterSpacing: '0.05em',
        }}>★★★★★</span>
      </span>
      <span style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>{r.toFixed(1)}</span>
    </span>
  );
}

// Shows difficulty value color-coded by level
function DifficultyBadge({ difficulty }) {
  if (difficulty == null) return <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>N/A</span>;
  const d = parseFloat(difficulty);
  const color = d >= 4 ? 'var(--error-text)' : d >= 3 ? '#F59E0B' : 'var(--success-text)';
  const label = d >= 4 ? 'Hard' : d >= 3 ? 'Moderate' : 'Easy';
  return (
    <span style={{ color, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
      {d.toFixed(1)} <span style={{ fontSize: '0.8em', color: 'var(--text-secondary)' }}>({label})</span>
    </span>
  );
}

export default function Professors({ initialQuery = '' }) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [allProfessors, setAllProfessors] = useState(null); // cached full list
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [error, setError] = useState(null);

  // Normalize like ProfessorDB.normalizeRmpName: trim -> toLowerCase
  const normalizeRmpName = (name) => {
    if (!name) return '';
    return String(name).trim().toLowerCase().replace(/\s+/g, ' ');
  };

  // Fetch full list from backend and cache it. If q provided and non-empty,
  // filter the cached list using normalizeRmpName. If cache missing, fetch first.
  const fetchProfessors = async (q = '') => {
    setError(null);
    setIsLoading(true);
    setSearchPerformed(true);
    try {
      // Ensure we have the full list cached
      let list = allProfessors;
      if (!list) {
        const res = await api.searchProfessors('');
        const raw = Array.isArray(res)
          ? res
          : (Array.isArray(res.professors) ? res.professors : (Array.isArray(res.data) ? res.data : []));
        // Filter out null entries and professors with no name (no RMP profile)
        list = raw.filter(p => p && (p.name || p.professor) && String(p.name || p.professor).trim() !== '');
        setAllProfessors(list);
        console.debug('Fetched professors (cached):', list.length, 'items');
      }

      const qNorm = normalizeRmpName(q || '');
      if (!qNorm) {
        setResults(list);
      } else {
        const filtered = list.filter((p) => {
          const n = normalizeRmpName(p?.name || p?.professor || '');
          return n.includes(qNorm);
        });
        setResults(filtered);
      }
    } catch (err) {
      console.error('Failed to fetch professors', err);
      setError(err.message || String(err));
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    const q = query.trim();
    await fetchProfessors(q);
  };

  // Load all professors on mount (using initialQuery if provided)
  useEffect(() => {
    fetchProfessors(initialQuery || '');
  }, []);

  // Debounced local filtering when typing: filter cached allProfessors using normalizeRmpName
  const searchDebounceRef = useRef(null);
  useEffect(() => {
    const q = query.trim();
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      // if empty query, restore full list (cached or fetch)
      if (q === '') {
        if (allProfessors) {
          setResults(allProfessors);
        } else {
          fetchProfessors('');
        }
        return;
      }

      // If we have cached list, filter locally using normalizeRmpName
      if (allProfessors) {
        const qNorm = normalizeRmpName(q);
        const filtered = allProfessors.filter((p) => normalizeRmpName(p?.name || p?.professor || '').includes(qNorm));
        setResults(filtered);
      } else {
        // fallback: fetch full list then filter
        fetchProfessors(q);
      }
    }, 300);

    return () => {
      if (searchDebounceRef.current) {
        clearTimeout(searchDebounceRef.current);
        searchDebounceRef.current = null;
      }
    };
  }, [query, allProfessors]);

  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [closeHover, setCloseHover] = useState(false);

  const onKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  // Close modal on ESC
  useEffect(() => {
    const onEsc = (e) => { if (e.key === 'Escape') setSelectedProfessor(null); };
    if (selectedProfessor) document.addEventListener('keydown', onEsc);
    return () => document.removeEventListener('keydown', onEsc);
  }, [selectedProfessor]);

  // Reset hover state when modal closes
  useEffect(() => {
    if (!selectedProfessor) setCloseHover(false);
  }, [selectedProfessor]);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1rem 1.5rem', background: 'var(--bg-page)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <h2 style={{ margin: 0 }}>Professors</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: '1 1 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', padding: '0.35rem 0.6rem', borderRadius: '8px', flex: 1 }}>
              <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Search professors by name"
                style={{ flex: 1, marginLeft: '0.5rem', border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-title)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleSearch}
                style={{ padding: '0.45rem 0.8rem', borderRadius: '8px', border: 'none', background: query.trim() === '' ? 'var(--border-subtle)' : 'var(--primary-color)', color: query.trim() === '' ? 'var(--text-secondary)' : 'white', cursor: 'pointer' }}
              >
                {query.trim() === '' ? 'Refresh' : 'Search'}
              </button>

              {query.trim() !== '' && (
                <button
                  onClick={() => { setQuery(''); fetchProfessors(''); }}
                  style={{ padding: '0.35rem 0.6rem', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: '1rem 1.5rem', overflowY: 'auto', flex: 1 }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
            <Loader2 size={28} style={{ animation: 'spin 1s linear infinite' }} />
            <div>{searchPerformed ? 'Searching professors...' : 'Loading professors...'}</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {error && (
              <div style={{ color: 'var(--error-text)', marginBottom: '0.5rem' }}>Error loading professors: {error}</div>
            )}
            {results.length > 0 && (
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Showing {results.length} professors</div>
            )}

            {results.length === 0 ? (
              searchPerformed ? (
                <div style={{ color: 'var(--text-secondary)' }}>No professors found.</div>
              ) : (
                <div style={{ color: 'var(--text-secondary)' }}>No professors available.</div>
              )
            ) : (
              results.map((p) => {
                const rating = p.overallRating ?? p.avgRating ?? p.rating ?? null;
                const diff = p.difficulty ?? null;
                return (
                  <div
                    key={p.id || p.name}
                    onClick={() => setSelectedProfessor(p)}
                    onKeyDown={(e) => { if (e.key === 'Enter') setSelectedProfessor(p); }}
                    role="button"
                    tabIndex={0}
                    style={{ padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--bg-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', gap: '1rem' }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.department || p.dept || ''}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.2rem', flexShrink: 0 }}>
                      <StarRating rating={rating} />
                      <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Difficulty:</span>
                        <DifficultyBadge difficulty={diff} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Modal for selected professor */}
      {selectedProfessor && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }} onClick={() => setSelectedProfessor(null)}>
          <div role="dialog" aria-modal="true" aria-label={`Professor ${selectedProfessor.name}`} onClick={(e) => e.stopPropagation()} style={{ width: 'min(900px, 98%)', background: 'var(--bg-panel)', borderRadius: '10px', padding: '1rem 1.25rem', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', color: 'var(--text-primary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <h3 style={{ margin: 0 }}>{selectedProfessor.name}</h3>
              <button
                aria-label="Close professor modal"
                onClick={() => setSelectedProfessor(null)}
                onMouseEnter={() => setCloseHover(true)}
                onMouseLeave={() => setCloseHover(false)}
                onFocus={() => setCloseHover(true)}
                onBlur={() => setCloseHover(false)}
                style={{
                  background: closeHover ? 'rgba(239,68,68,0.12)' : 'transparent',
                  border: `1px solid ${closeHover ? 'var(--error-text)' : 'var(--border-color)'}`,
                  color: closeHover ? 'var(--error-text)' : 'var(--text-primary)',
                  borderRadius: '6px',
                  padding: '0.35rem 0.6rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <span style={{ fontWeight: 700, lineHeight: 1, color: closeHover ? 'var(--error-text)' : 'inherit' }}>✕</span>
                <span style={{ fontSize: '0.95rem' }}>Close</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              {/* LEFT: rating, tags, number of ratings, department */}
              <div style={{ flex: '0 0 38%', minWidth: 240 }}>
                <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>{selectedProfessor.department || selectedProfessor.dept || ''}</div>
                <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <strong>Overall Rating:</strong>
                  <StarRating rating={selectedProfessor.overallRating ?? selectedProfessor.avgRating ?? selectedProfessor.rating ?? null} />
                </div>
                <div style={{ marginBottom: '0.5rem' }}><strong>Ratings:</strong> <span style={{ marginLeft: '0.4rem' }}>{selectedProfessor.ratingsCount ?? selectedProfessor.numRatings ?? selectedProfessor.num_ratings ?? 'N/A'}</span></div>
                <div style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <strong>Difficulty:</strong>
                  <DifficultyBadge difficulty={selectedProfessor.difficulty ?? null} />
                </div>

                {/* Tags */}
                {(() => {
                  const prof = selectedProfessor || {};
                  const tags = prof.tags || prof.topTags || prof.tagNames || prof.tagsList || prof.top_tags || prof.tags || prof.attributes || [];
                  const arr = Array.isArray(tags) ? tags : (typeof tags === 'string' ? tags.split(/[,;|]/).map(s => s.trim()).filter(Boolean) : []);
                  if (arr.length === 0) return null;
                  return (
                    <div style={{ marginTop: '0.6rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {arr.map((t, i) => (
                        <span key={i} style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid var(--border-color)' }}>{t}</span>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* RIGHT: recent reviews (scrollable) */}
              <div style={{ flex: '1 1 62%', maxHeight: '56vh', overflowY: 'auto', background: 'var(--bg-card)', padding: '0.6rem', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <div style={{ fontWeight: 600 }}>Recent reviews</div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{(selectedProfessor.ratingsCount ?? selectedProfessor.numRatings ?? selectedProfessor.num_ratings ?? (Array.isArray(selectedProfessor.recentReviews) ? selectedProfessor.recentReviews.length : (Array.isArray(selectedProfessor.comments) ? selectedProfessor.comments.length : ''))) || ''}</div>
                </div>

                {(() => {
                  const prof = selectedProfessor || {};
                  // Prefer recentReviews array if present
                  let reviews = [];
                  if (Array.isArray(prof.recentReviews)) reviews = prof.recentReviews;
                  else if (Array.isArray(prof.reviews)) reviews = prof.reviews;
                  else if (Array.isArray(prof.comments)) reviews = prof.comments.map(c => (typeof c === 'string' ? { comment: c } : c));
                  else if (Array.isArray(prof.ratings)) reviews = prof.ratings.map(r => ({ comment: r.comment || r.text || r.review || r.summary || '', quality: r.quality || r.rating || r.score, difficulty: r.difficulty, course: r.course, date: r.date || r.timestamp || r.created_at }));

                  // normalize each review to {text, quality, difficulty, course, date}
                  const normalizeReview = (r) => {
                    if (!r) return { text: '' };
                    if (typeof r === 'string') return { text: r };
                    const text = r.comment || r.commentText || r.text || r.review || r.summary || '';
                    return {
                      text,
                      quality: r.quality ?? r.rating ?? r.score ?? null,
                      difficulty: r.difficulty ?? null,
                      course: r.course ?? r.class ?? null,
                      date: r.date ?? r.timestamp ?? r.created_at ?? null,
                    };
                  };

                  let list = reviews.map(normalizeReview).filter(x => x.text && x.text.trim() !== '');

                  // parse/normalize dates: try to handle '2026-03-24 15:35:46 +0000 UTC'
                  const parseDate = (s) => {
                    if (!s) return null;
                    // try native parse
                    let d = Date.parse(s);
                    if (!isNaN(d)) return new Date(d);
                    // replace timezone ' +0000 UTC' or trailing ' UTC' with 'Z'
                    const alt = String(s).replace(/\s+\+\d{4}\s+UTC$/, 'Z').replace(/\s+UTC$/, 'Z');
                    d = Date.parse(alt);
                    if (!isNaN(d)) return new Date(d);
                    // try removing the offset part
                    const short = String(s).split(' +')[0];
                    d = Date.parse(short);
                    if (!isNaN(d)) return new Date(d);
                    return null;
                  };

                  list = list.map(item => ({ ...item, parsedDate: parseDate(item.date) }));

                  // sort by date descending when possible
                  list = list.sort((a, b) => {
                    const da = a.parsedDate ? a.parsedDate.getTime() : 0;
                    const db = b.parsedDate ? b.parsedDate.getTime() : 0;
                    return (db || 0) - (da || 0);
                  });

                  if (list.length === 0) return <div style={{ color: 'var(--text-secondary)' }}>No reviews available.</div>;

                  return list.map((c, i) => (
                    <div key={i} style={{ marginBottom: '0.75rem', padding: '0.6rem', borderRadius: '6px', background: 'var(--bg-panel)', border: '1px solid var(--border-subtle)', boxShadow: '0 1px 0 rgba(0,0,0,0.04)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{c.course || ''}</div>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                          {c.quality != null && <div style={{ fontSize: '0.85rem', color: 'var(--primary-color)' }}>Rating: {c.quality}</div>}
                          {c.difficulty != null && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Difficulty: {c.difficulty}</div>}
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{c.parsedDate ? c.parsedDate.toLocaleDateString() : ''}</div>
                        </div>
                      </div>
                      <div style={{ marginTop: '0.4rem', whiteSpace: 'pre-wrap', fontSize: '0.95rem', color: 'var(--text-primary)' }}>{c.text}</div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }`}</style>
    </div>
  );
}

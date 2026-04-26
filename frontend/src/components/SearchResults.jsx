/**
 * SearchResults.jsx
 * Author: Haddon Baker
 * Description: Displays the results of a course search, allowing users to view details or add courses to their schedule.
 */
import React, { useState } from 'react';
import { Info, Loader2 } from 'lucide-react';
import CourseDetailsModal from './CourseDetailsModal';
import { formatMeetingTimes, courseKey } from '../utils/courseUtils';

function SearchResults({
  results = [],
  onAddCourse = () => {},
  onToggleFavorite = () => {},
  favorites = [],
  isLoggedIn = false,
  searchPerformed = false,
  isLoading = false,
  onClearResults = () => {},
  onSearchProfessor
}) {
  const [viewCourse, setViewCourse] = useState(null);

  const panelStyle = {
    padding: '1.25rem',
    background: 'var(--bg-panel)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    width: '100%',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
    boxSizing: 'border-box',
  };

  const resultsHeaderStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  };

  const headingStyle = {
    color: 'var(--primary-color)',
    fontSize: '1.25rem',
    margin: 0,
  };

  const courseContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };

  const courseCardStyle = {
    padding: '0.75rem 1rem',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    background: 'var(--bg-card)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
  };

  const courseInfoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flex: 1,
    flexWrap: 'wrap',
  };

  const courseTitleStyle = {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0,
    minWidth: '80px',
  };

  const compactDetailStyle = {
    fontSize: '0.85rem',
    color: 'var(--text-secondary)',
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  };

  const statusStyle = (isOpen) => ({
    fontSize: '0.8rem',
    fontWeight: '600',
    color: isOpen ? 'var(--success-text)' : 'var(--error-text)',
  });

  const addButtonStyle = {
    padding: '0.4rem 0.8rem',
    background: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap',
  };

  const infoButtonStyle = {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  };

  const clearButtonStyle = {
    background: 'transparent',
    border: '1px solid var(--danger-color)',
    color: 'var(--danger-color)',
    padding: '0.4rem 0.8rem',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  };

  const emptyStateStyle = {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    margin: 0,
  };

  const noResultsStyle = {
    ...emptyStateStyle,
    color: 'var(--error-text)',
  };

  const loadingContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    gap: '1rem',
    color: 'var(--text-secondary)',
  };

  if (isLoading) {
    return (
      <div style={panelStyle}>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div style={loadingContainerStyle}>
          <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
          <div>Searching for courses...</div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {// Show a different message if no search has been performed yet vs if a search was performed but returned no results
    const message = searchPerformed
      ? "No results found for this query. Please try a different search."
      : "No results yet. Search for classes to see them here.";
    return (
      <div style={panelStyle}>
        <div style={resultsHeaderStyle}>
          <h2 style={headingStyle}>Search Results</h2>
        </div>
        <p style={searchPerformed ? noResultsStyle : emptyStateStyle}>{message}</p>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <div style={resultsHeaderStyle}>
        <h2 style={headingStyle}>Search Results ({results.length})</h2>
        <button
          style={clearButtonStyle}
          onClick={onClearResults}
          onMouseEnter={(e) => {
            e.target.style.background = 'var(--danger-color)';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = 'var(--danger-color)';
          }}
        >
          Clear Search
        </button>
      </div>
      <div style={courseContainerStyle}>
        {results.map((course, index) => (
          <div key={index} style={courseCardStyle}>
            <div style={courseInfoStyle}>
              <div style={courseTitleStyle}>
                {course.department} {course.code}{course.section ? `${course.section}` : ''}
              </div>
              
              <div style={compactDetailStyle}>
                <span>{formatMeetingTimes(course.meetingTimes)}</span>
                <span>{course.credits} cr</span>
                <span style={statusStyle(course.openSeats > 0)}>
                  {course.openSeats > 0 ? 'Open' : 'Closed'}
                </span>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>

              {/* Info button */}
              <button
                style={infoButtonStyle}
                onClick={() => setViewCourse(course)}
                title="View Details"
              >
                <Info size={18} />
              </button>

              {/* Favorite button — only for logged-in users */}
              {isLoggedIn && (
                <button
                  onClick={() => onToggleFavorite(course)}
                  title="Toggle Favorite"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1,
                  }}
                >
                  {favorites?.some(c => courseKey(c) === courseKey(course)) ? '⭐' : '☆'}
                </button>
              )}

              {/* Add button */}
              <button
                style={addButtonStyle}
                onClick={() => onAddCourse(course)}
                onMouseEnter={(e) => (e.target.style.background = 'var(--primary-dark)')}
                onMouseLeave={(e) => (e.target.style.background = 'var(--primary-color)')}
              >
                Add
              </button>

            </div>
          </div>
        ))}
      </div>
      {viewCourse && <CourseDetailsModal course={viewCourse} onClose={() => setViewCourse(null)} onSearchProfessor={onSearchProfessor} />}
    </div>
  );
}



export default SearchResults;
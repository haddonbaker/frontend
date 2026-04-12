/**
 * SearchResults.jsx
 * Author: Haddon Baker
 * Description: Displays the results of a course search, allowing users to view details or add courses to their schedule.
 */
import React, { useState } from 'react';
import { Info, Loader2 } from 'lucide-react';
import CourseDetailsModal from './CourseDetailsModal';

function SearchResults({ results = [], onAddCourse = () => {}, searchPerformed = false, isLoading = false, onClearResults = () => {} }) {
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
    color: isOpen ? '#059669' : '#DC2626',
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
    border: '1px solid #EF5350',
    color: '#EF5350',
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
    color: '#DC2626',
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

  // UX for search loading state - shows a spinner and message while waiting for results
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

  // Helper function to format meeting times into a user-friendly string
  const formatTime = (hour, minute) => {
    if (hour == null || minute == null) return '';
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    const displayMinutes = m < 10 ? `0${m}` : m;
    return `${displayHour}:${displayMinutes} ${ampm}`;
  };

  // Helper function to format meeting times into a user-friendly string, grouping by time ranges and sorting by days of the week
  const formatMeetingTimes = (times) => {
    if (!times || times.length === 0) return 'TBA';

    // Consistent day mapping and order
    const dayMap = { MONDAY: 'M', TUESDAY: 'T', WEDNESDAY: 'W', THURSDAY: 'R', FRIDAY: 'F', SATURDAY: 'S', SUNDAY: 'U' };
    const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

    const timeGroups = new Map();

    times.forEach(time => {
      const startTimeInMinutes = time.hour * 60 + time.minute;
      // Use minutesLong for end time calculation, with a fallback for safety
      const endTimeInMinutes = startTimeInMinutes + (time.minutesLong || 0); 
      const endHour = Math.floor(endTimeInMinutes / 60) % 24;
      const endMinute = endTimeInMinutes % 60;
      const timeRangeStr = `${formatTime(time.hour, time.minute)} - ${formatTime(endHour, endMinute)}`;
      
      if (!timeGroups.has(timeRangeStr)) {
        timeGroups.set(timeRangeStr, []);
      }

      // Normalize day to uppercase to handle inconsistencies like 'Monday' vs 'MONDAY'
      const day = typeof time.day === 'string' ? time.day.toUpperCase() : '';
      if (dayOrder.includes(day)) {
        timeGroups.get(timeRangeStr).push(day);
      }
    });

    // For each time group, sort the days chronologically.
    for (const days of timeGroups.values()) {
      days.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
    }

    // Sort the time groups themselves based on the first day they occur in the week.
    const sortedEntries = [...timeGroups.entries()].sort((a, b) => {
      // Make sure there are days to sort by
      if (a[1].length === 0 || b[1].length === 0) return 0;
      const firstDayA = dayOrder.indexOf(a[1][0]);
      const firstDayB = dayOrder.indexOf(b[1][0]);
      return firstDayA - firstDayB;
    });

    return sortedEntries.map(([timeRange, days]) => {
      // Join the abbreviated days. If a day isn't in our map, it's an issue, so flag it.
      const dayStr = days.map(d => dayMap[d] || '?').join('');
      return `${dayStr} ${timeRange}`;
    }).join(', ');
  };

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
            e.target.style.background = '#EF5350';
            e.target.style.color = 'white';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'transparent';
            e.target.style.color = '#EF5350';
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
            
            <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
              <button 
                style={infoButtonStyle} 
                onClick={() => setViewCourse(course)}
                title="View Details"
              >
                <Info size={18} />
              </button>
            <button
              style={addButtonStyle}
              onClick={() => onAddCourse(course)}
              onMouseEnter={(e) => e.target.style.background = '#1565C0'}
              onMouseLeave={(e) => e.target.style.background = '#1976D2'}
            >
              Add
            </button>
            </div>
          </div>
        ))}
      </div>
      {viewCourse && <CourseDetailsModal course={viewCourse} onClose={() => setViewCourse(null)} />}
    </div>
  );
}

export default SearchResults;
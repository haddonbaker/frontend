import React, { useState } from 'react';
import { Info, Loader2 } from 'lucide-react';
import CourseDetailsModal from './CourseDetailsModal';

function SearchResults({ results = [], onAddCourse = () => {}, searchPerformed = false, isLoading = false }) {
  const [viewCourse, setViewCourse] = useState(null);

  const panelStyle = {
    padding: '1.25rem',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    width: '100%',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
    boxSizing: 'border-box', // important for padding + width
  };

  const headingStyle = {
    color: '#1976D2',
    fontSize: '1.25rem',
    marginTop: 0,
    marginBottom: '0.75rem',
  };

  const courseContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  };

  const courseCardStyle = {
    padding: '0.75rem 1rem',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    background: '#FAFBFC',
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
    color: '#1F2937',
    margin: 0,
    minWidth: '80px',
  };

  const compactDetailStyle = {
    fontSize: '0.85rem',
    color: '#555',
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
    background: '#1976D2',
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
    color: '#6B7280',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  };

  const emptyStateStyle = {
    color: '#6B7280',
    fontSize: '0.95rem',
    margin: 0,
  };

  const noResultsStyle = {
    ...emptyStateStyle,
    color: '#DC2626', // A shade of red
  };

  const loadingContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    gap: '1rem',
    color: '#6B7280',
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


  const formatTime = (hour, minute) => {
    if (hour == null || minute == null) return '';
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 || 12;
    const displayMinutes = m < 10 ? `0${m}` : m;
    return `${displayHour}:${displayMinutes} ${ampm}`;
  };

  const formatMeetingTimes = (times) => {
    if (!times || times.length === 0) return 'TBA';

    const dayMap = { Monday: 'M', Tuesday: 'T', Wednesday: 'W', Thursday: 'R', Friday: 'F', Saturday: 'S', Sunday: 'U' };
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    const timeGroups = new Map();

    times.forEach(time => {
      const startTimeInMinutes = time.hour * 60 + time.minute;
      const endTimeInMinutes = startTimeInMinutes + time.minutesLong;
      const endHour = Math.floor(endTimeInMinutes / 60) % 24;
      const endMinute = endTimeInMinutes % 60;
      const timeRangeStr = `${formatTime(time.hour, time.minute)} - ${formatTime(endHour, endMinute)}`;
      if (!timeGroups.has(timeRangeStr)) {
        timeGroups.set(timeRangeStr, []);
      }
      timeGroups.get(timeRangeStr).push(time.day);
    });

    const sortedEntries = [...timeGroups.entries()].sort((a, b) => {
      const firstDayA = a[1].sort((d1, d2) => dayOrder.indexOf(d1) - dayOrder.indexOf(d2))[0];
      const firstDayB = b[1].sort((d1, d2) => dayOrder.indexOf(d1) - dayOrder.indexOf(d2))[0];
      return dayOrder.indexOf(firstDayA) - dayOrder.indexOf(firstDayB);
    });

    return sortedEntries.map(([timeRange, days]) => {
      const dayStr = days.map(d => dayMap[d] || d).join('');
      return `${dayStr} ${timeRange}`;
    }).join(', ');
  };

  if (results.length === 0) {
    const message = searchPerformed
      ? "No results found for this query. Please try a different search."
      : "No results yet. Search for classes to see them here.";
    return (
      <div style={panelStyle}>
        <h2 style={headingStyle}>Search Results</h2>
        <p style={searchPerformed ? noResultsStyle : emptyStateStyle}>{message}</p>
      </div>
    );
  }

  return (
    <div style={panelStyle}>
      <h2 style={headingStyle}>Search Results ({results.length})</h2>
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
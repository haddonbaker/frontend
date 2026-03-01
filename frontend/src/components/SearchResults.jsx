import React, { useState } from 'react';
import { Info } from 'lucide-react';
import CourseDetailsModal from './CourseDetailsModal';

function SearchResults({ results = [], onAddCourse = () => {} }) {
  const [viewCourse, setViewCourse] = useState(null);

  const panelStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '1.25rem',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    width: '100%',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
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

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDays = (times) => {
    if (!times || times.length === 0) return 'TBA';
    const dayMap = { M: 'Mon', T: 'Tue', W: 'Wed', R: 'Thu', F: 'Fri', S: 'Sat', U: 'Sun' };
    return times.map(t => dayMap[t.day] || t.day).join(', ');
  };

  const formatTimeRange = (times) => {
    if (!times || times.length === 0) return 'TBA';
    const firstTime = times[0];
    return `${formatTime(firstTime.start_time)} - ${formatTime(firstTime.end_time)}`;
  };

  if (results.length === 0) {
    return (
      <div style={panelStyle}>
        <h2 style={headingStyle}>Search Results</h2>
        <p style={emptyStateStyle}>No results yet. Search for classes to see them here.</p>
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
                {course.subject} {course.number}
              </div>
              
              <div style={compactDetailStyle}>
                <span>{formatDays(course.times)} {formatTimeRange(course.times)}</span>
                <span>{course.credits} cr</span>
                <span style={statusStyle(course.is_open)}>
                  {course.is_open ? 'Open' : 'Closed'}
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
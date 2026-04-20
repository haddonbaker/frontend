import React, { useState } from 'react';
import { Info } from 'lucide-react';
import CourseDetailsModal from './CourseDetailsModal';

function AlternativesModal({ course, alternatives, onClose, onAddCourse, onSearchProfessor }) {
  const [viewCourse, setViewCourse] = useState(null);

  // Helper function to format meeting times (copied from SearchResults for consistency)
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
    const dayMap = { MONDAY: 'M', TUESDAY: 'T', WEDNESDAY: 'W', THURSDAY: 'R', FRIDAY: 'F', SATURDAY: 'S', SUNDAY: 'U' };
    const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const timeGroups = new Map();

    times.forEach(time => {
      const startTimeInMinutes = time.hour * 60 + time.minute;
      const endTimeInMinutes = startTimeInMinutes + (time.minutesLong || 0); 
      const endHour = Math.floor(endTimeInMinutes / 60) % 24;
      const endMinute = endTimeInMinutes % 60;
      const timeRangeStr = `${formatTime(time.hour, time.minute)} - ${formatTime(endHour, endMinute)}`;
      
      if (!timeGroups.has(timeRangeStr)) timeGroups.set(timeRangeStr, []);
      const day = typeof time.day === 'string' ? time.day.toUpperCase() : '';
      if (dayOrder.includes(day)) timeGroups.get(timeRangeStr).push(day);
    });

    for (const days of timeGroups.values()) {
      days.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
    }

    const sortedEntries = [...timeGroups.entries()].sort((a, b) => {
      if (a[1].length === 0 || b[1].length === 0) return 0;
      return dayOrder.indexOf(a[1][0]) - dayOrder.indexOf(b[1][0]);
    });

    return sortedEntries.map(([timeRange, days]) => {
      const dayStr = days.map(d => dayMap[d] || '?').join('');
      return `${dayStr} ${timeRange}`;
    }).join(', ');
  };

  // Styles matching SearchResults
  const courseCardStyle = {
    padding: '0.75rem 1rem',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    background: 'var(--bg-card)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.75rem',
    marginBottom: '0.75rem',
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

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-panel)', color: 'var(--text-primary)', padding: '20px', borderRadius: '8px',
        maxWidth: '800px', width: '90%', maxHeight: '80vh', overflowY: 'auto'
      }}>
        <h3>Alternative Courses {course ? `for ${course.department} ${course.code}${course.section ? ` ${course.section}` : ''}` : ''}</h3>
        {course && (
          <p style={{ marginTop: '-0.5rem', marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
            <strong>Original Time:</strong> {formatMeetingTimes(course.meetingTimes)}
          </p>
        )}
        <div>
          {alternatives.length > 0 ? (
            <div>
              {alternatives.map((alt) => (
                <div key={alt.courseCode} style={courseCardStyle}>
                  <div style={courseInfoStyle}>
                    <div style={courseTitleStyle}>
                      {alt.department} {alt.code}{alt.section ? `${alt.section}` : ''}
                    </div>
                    
                    <div style={compactDetailStyle}>
                      <span>{formatMeetingTimes(alt.meetingTimes)}</span>
                      <span>{alt.credits} cr</span>
                      <span style={statusStyle(alt.openSeats > 0)}>
                        {alt.openSeats > 0 ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{display: 'flex', gap: '0.5rem', alignItems: 'center'}}>
                    <button 
                      style={infoButtonStyle} 
                      onClick={() => setViewCourse(alt)}
                      title="View Details"
                    >
                      <Info size={18} />
                    </button>
                    <button
                      style={addButtonStyle}
                      onClick={() => { onAddCourse(alt); onClose(); }}
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : <p>No alternatives found.</p>}
        </div>
        <div style={{ marginTop: '15px', textAlign: 'right' }}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
      {viewCourse && <CourseDetailsModal course={viewCourse} onClose={() => setViewCourse(null)} onSearchProfessor={onSearchProfessor} />}
    </div>
  );
}

export default AlternativesModal;

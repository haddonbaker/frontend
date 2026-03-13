import React from 'react';
import { X } from 'lucide-react';

function CourseDetailsModal({ course, onClose }) {
  if (!course) return null;

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1100,
  };

  const modalStyle = {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    position: 'relative',
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'start',
    marginBottom: '1rem',
    borderBottom: '1px solid #eee',
    paddingBottom: '0.5rem',
  };

  const titleStyle = {
    margin: 0,
    color: '#1976D2',
    fontSize: '1.25rem',
  };

  const closeButtonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#666',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  };

  const rowStyle = {
    marginBottom: '0.75rem',
    fontSize: '0.95rem',
    lineHeight: '1.5',
  };

  const labelStyle = {
    fontWeight: '600',
    color: '#444',
    marginRight: '0.5rem',
  };
  
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

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>{course.department} {course.code}{course.section ? `${course.section}` : ''}</h3>
          <button style={closeButtonStyle} onClick={onClose}><X size={24} /></button>
        </div>
        
        <div style={{marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.1rem', color: '#333'}}>
          {course.name}
        </div>
        
        {course.description && <div style={{...rowStyle, fontStyle: 'italic', color: '#555'}}>{course.description}</div>}

        <div style={rowStyle}><span style={labelStyle}>Professor(s):</span>{course.professorNames?.join(', ') || 'TBA'}</div>
        <div style={rowStyle}><span style={labelStyle}>Section:</span>{course.section}</div>
        <div style={rowStyle}><span style={labelStyle}>Credits:</span>{course.credits}</div>
        <div style={rowStyle}><span style={labelStyle}>Schedule:</span>{formatMeetingTimes(course.meetingTimes)}</div>
        {/* Location is not in the new format */}
        {/* <div style={rowStyle}><span style={labelStyle}>Location:</span>{course.location || 'TBA'}</div> */}
        {course.prerequisites && course.prerequisites.length > 0 && <div style={rowStyle}><span style={labelStyle}>Prerequisites:</span>{course.prerequisites.join(', ')}</div>}
        <div style={rowStyle}>
          <span style={labelStyle}>Seats:</span>
          {course.openSeats} / {course.maxCapacity}
          <span style={{
            marginLeft: '10px', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold',
            backgroundColor: course.openSeats > 0 ? '#d1fae5' : '#fee2e2', color: course.openSeats > 0 ? '#065f46' : '#991b1b'
          }}>
            {course.openSeats > 0 ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CourseDetailsModal;
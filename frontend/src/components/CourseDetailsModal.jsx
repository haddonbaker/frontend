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

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={headerStyle}>
          <h3 style={titleStyle}>{course.subject} {course.number}</h3>
          <button style={closeButtonStyle} onClick={onClose}><X size={24} /></button>
        </div>
        
        <div style={{marginBottom: '1rem', fontWeight: 'bold', fontSize: '1.1rem', color: '#333'}}>
          {course.name}
        </div>

        <div style={rowStyle}><span style={labelStyle}>Faculty:</span>{course.faculty?.join(', ') || 'TBA'}</div>
        <div style={rowStyle}><span style={labelStyle}>Section:</span>{course.section}</div>
        <div style={rowStyle}><span style={labelStyle}>Credits:</span>{course.credits}</div>
        <div style={rowStyle}><span style={labelStyle}>Schedule:</span>{formatDays(course.times)} {formatTimeRange(course.times)}</div>
        <div style={rowStyle}><span style={labelStyle}>Location:</span>{course.location}</div>
        <div style={rowStyle}>
          <span style={labelStyle}>Seats:</span>
          {course.open_seats} / {course.total_seats}
          <span style={{
            marginLeft: '10px', padding: '2px 8px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 'bold',
            backgroundColor: course.is_open ? '#d1fae5' : '#fee2e2', color: course.is_open ? '#065f46' : '#991b1b'
          }}>
            {course.is_open ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default CourseDetailsModal;
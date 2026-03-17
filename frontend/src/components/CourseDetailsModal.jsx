/**
 * CourseDetailsModal.jsx
 * Author: Haddon Baker
 * Description: A modal displaying detailed information about a specific course.
 */
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
  
  // Helper function to format time in 12-hour format with AM/PM
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
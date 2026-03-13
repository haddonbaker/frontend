import React, { useState } from 'react';
import { Info } from 'lucide-react';
import CourseDetailsModal from './CourseDetailsModal';
import * as api from '../apiService';

function CandidateSchedule({ schedule = [], student, onRemoveCourse = () => {}, openModal }) {
  const [viewCourse, setViewCourse] = useState(null);
  const courses = schedule.courses || [];
  const totalCredits = schedule.totalCredits || 0;
  const panelStyle = {
    width: '100%',
    maxWidth: '250px',
    padding: '1.25rem',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  };

  const headingStyle = {
    color: '#1976D2',
    fontSize: '1.25rem',
    marginTop: 0,
    marginBottom: '0.75rem',
  };

  const subHeadingStyle = {
    color: '#6B7280',
    fontSize: '0.9rem',
    marginTop: '-0.5rem',
    marginBottom: '1rem',
  };

  const courseContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    flex: 1,
    overflowY: 'auto',
  };

  const courseCardStyle = {
    padding: '0.75rem 1rem',
    border: '1px solid #E5E7EB',
    borderRadius: '8px',
    background: '#F0F7FF',
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

  const removeButtonStyle = {
    padding: '0.4rem 0.8rem',
    background: '#EF5350',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap',
    height: 'fit-content',
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

  const actionButtonsStyle = {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1rem',
  };

  const buttonStyle = {
    padding: '0.6rem 1.2rem',
    background: '#1976D2',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s, box-shadow 0.2s',
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: '#FFFFFF',
    color: '#1976D2',
    border: '2px solid #1976D2',
  };

  const emptyStateStyle = {
    color: '#6B7280',
    fontSize: '0.95rem',
    margin: 0,
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

  const formatDays = (times) => {
    if (!times || times.length === 0) return 'TBA';
    const dayMap = { Monday: 'M', Tuesday: 'T', Wednesday: 'W', Thursday: 'R', Friday: 'F', Saturday: 'S', Sunday: 'U' };
    const uniqueDays = [...new Set(times.map(t => t.day))];
    return uniqueDays.map(d => dayMap[d] || d).join('');
  };

  const formatTimeRange = (times) => {
    if (!times || times.length === 0) return 'TBA';
    const firstTime = times[0];
    const startHour = firstTime.hour;
    const startMinute = firstTime.minute;

    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = startTimeInMinutes + firstTime.minutesLong;

    const endHour = Math.floor(endTimeInMinutes / 60) % 24;
    const endMinute = endTimeInMinutes % 60;

    return `${formatTime(startHour, startMinute)} - ${formatTime(endHour, endMinute)}`;
  };

  const handleSaveSchedule = async () => {
    if (!student) {
      alert('Student information is not available to save schedule.');
      return;
    }
    try {
      await api.saveSchedule(schedule, student);
      alert('Schedule saved successfully!');
    } catch (error) {
      alert(`Error saving schedule: ${error.message}`);
    }
  };

  
  return (
    <div style={panelStyle}>
      <h2 style={headingStyle}>Candidate Schedule</h2>
      {courses.length > 0 && (
        <div style={subHeadingStyle}>
          ({courses.length} courses, {totalCredits} credits)
        </div>
      )}

      <div style={actionButtonsStyle}>
        <button
          onClick={openModal}
          style={buttonStyle}
          onMouseEnter={(e) => (e.target.style.background = '#1565C0')}
          onMouseLeave={(e) => (e.target.style.background = '#1976D2')}
        >
          View Weekly Schedule
        </button>
        <button
          onClick={handleSaveSchedule}
          style={secondaryButtonStyle}
          onMouseEnter={(e) => {
            e.target.style.background = '#EBF5FF';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#FFFFFF';
          }}
        >
          Save Schedule
        </button>
      </div>

      {courses.length > 0 ? (
        <div style={courseContainerStyle}>
          {courses.map((course) => (
            <div key={course.referenceNumber} style={courseCardStyle}>
              <div style={courseInfoStyle}>
                <div style={courseTitleStyle}>
                  {course.department} {course.code}{course.section ? `${course.section}` : ''}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button style={infoButtonStyle} onClick={() => setViewCourse(course)} title="View Details">
                  <Info size={18} />
                </button>
                <button style={removeButtonStyle} onClick={() => onRemoveCourse(course)} onMouseEnter={(e) => (e.target.style.background = '#EF4444')} onMouseLeave={(e) => (e.target.style.background = '#EF5350')}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p style={emptyStateStyle}>Courses added from search results will appear here.</p>
      )}

      {viewCourse && <CourseDetailsModal course={viewCourse} onClose={() => setViewCourse(null)} />}
    </div>
  );
}

export default CandidateSchedule;
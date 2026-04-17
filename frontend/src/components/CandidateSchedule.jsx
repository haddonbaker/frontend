/**
 * CandidateSchedule.jsx
 * Author: Haddon Baker
 * Description: Displays the list of selected courses for the candidate schedule, allows removing courses, viewing details, and saving.
 */
import React, { useState } from 'react';
import { Info } from 'lucide-react';
import CourseDetailsModal from './CourseDetailsModal';
import * as api from '../apiService';
import { useNotification } from './Notification';

function CandidateSchedule({ schedule = [], username, onRemoveCourse = () => {}, openModal, selectedSemester, selectedYear }) {
  const [viewCourse, setViewCourse] = useState(null);
  const courses = schedule.courses || [];
  const { showNotification } = useNotification();
  const totalCredits = schedule.totalCredits || 0;
  const panelStyle = {
    width: '300px',
    padding: '1.25rem',
    background: 'var(--bg-panel)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minHeight: 0,
    boxSizing: 'border-box',
    overflowX: 'hidden',
    overflowY: 'hidden',
  };

  const headingStyle = {
    color: 'var(--primary-color)',
    fontSize: '1.25rem',
    marginTop: 0,
    marginBottom: '0.75rem',
  };

  const subHeadingStyle = {
    color: 'var(--text-secondary)',
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
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    background: 'var(--bg-card-blue)',
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
    minWidth: 0,
  };

  const courseTitleStyle = {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: 0,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
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
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
  };

  const actionButtonsStyle = {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1rem',
  };

  const buttonStyle = {
    flex: 1,
    padding: '0.6rem 0.5rem',
    background: 'var(--primary-color)',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s, box-shadow 0.2s',
    whiteSpace: 'nowrap',
    textAlign: 'center',
  };

  const secondaryButtonStyle = {
    ...buttonStyle,
    background: 'var(--bg-panel)',
    color: 'var(--primary-color)',
    border: '2px solid var(--primary-color)',
  };

  const disabledButtonStyle = {
    ...secondaryButtonStyle,
    background: 'var(--bg-subtle)',
    color: 'var(--text-muted)',
    borderColor: 'var(--border-color)',
    cursor: 'not-allowed',
  };

  const emptyStateStyle = {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    margin: 0,
  };

  const handleSaveSchedule = async () => {
    if (!username) {
      showNotification('Log in to save your schedule.', 'error');
      return;
    }
    try {
      await api.saveSchedule(username, selectedSemester, selectedYear);
      showNotification('Schedule saved successfully!', 'success');
    } catch (error) {
      showNotification(`Error saving schedule: ${error.message}`, 'error');
    }
  };

  const isScheduleEmpty = courses.length === 0;

  
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
          View Schedule
        </button>
        <button
          onClick={handleSaveSchedule}
          disabled={isScheduleEmpty}
          style={isScheduleEmpty ? disabledButtonStyle : secondaryButtonStyle}
          onMouseEnter={(e) => {
            if (!isScheduleEmpty) e.target.style.background = '#EBF5FF';
          }}
          onMouseLeave={(e) => {
            if (!isScheduleEmpty) e.target.style.background = '#FFFFFF';
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

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
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
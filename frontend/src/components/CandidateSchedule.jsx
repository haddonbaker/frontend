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

function CandidateSchedule({ schedule = [], student, onRemoveCourse = () => {}, openModal, selectedSemester, selectedYear }) {
  const [viewCourse, setViewCourse] = useState(null);
  const courses = schedule.courses || [];
  const { showNotification } = useNotification();
  const totalCredits = schedule.totalCredits || 0;
  const panelStyle = {
    width: '300px',
    padding: '1.25rem',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
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
    minWidth: 0,
  };

  const courseTitleStyle = {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#1F2937',
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
    color: '#6B7280',
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
    background: '#1976D2',
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
    background: '#FFFFFF',
    color: '#1976D2',
    border: '2px solid #1976D2',
  };

  const disabledButtonStyle = {
    ...secondaryButtonStyle,
    background: '#F9FAFB',
    color: '#9CA3AF',
    borderColor: '#D1D5DB',
    cursor: 'not-allowed',
  };

  const emptyStateStyle = {
    color: '#6B7280',
    fontSize: '0.95rem',
    margin: 0,
  };

  const handleSaveSchedule = async () => {
    if (!student) {
      showNotification('Student information is not available to save schedule.', 'error');
      return;
    }
    try {
      await api.saveSchedule(schedule, student, selectedSemester, selectedYear);
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
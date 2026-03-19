/**
 * WeeklyScheduleModal.jsx
 * Author: Haddon Baker
 * Description: Displays a visual weekly schedule grid of the selected courses.
 */
import React, { useState, useEffect } from 'react';
import * as api from '../apiService';
import CourseDetailsModal from './CourseDetailsModal';
import { Italic } from 'lucide-react';

function WeeklyScheduleModal({ closeModal, schedule }) {
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creditHours, setCreditHours] = useState(0);
  const [viewCourse, setViewCourse] = useState(null);

  useEffect(() => {
    setCourses(schedule.courses || []);
    setCreditHours(schedule.totalCredits || 0);
    setIsLoading(false);
  }, []);
  const hours = Array.from({ length: 13 }, (_, i) => 8 + i); // 8am–8pm
  const modalStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: '#FFFFFF',
    border: '2px solid #1976D2',
    borderRadius: '12px',
    zIndex: 1000,
    width: '95%',
    maxWidth: '650px',
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
  };

  const contentStyle = {
    padding: '1.25rem',
    overflowY: 'auto',
    flex: 1,
  };

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  };

  const headingStyle = {
    color: '#1976D2',
    fontSize: '1.25rem',
    marginTop: 0,
    marginBottom: '1rem',
  };

  const gridContainerStyle = {
    display: 'grid',
    gridTemplateColumns: `70px repeat(5, 1fr)`,
    gridTemplateRows: `repeat(${hours.length}, 1fr)`, 
    textAlign: 'center',
    marginBottom: '1rem',
    fontSize: '0.85rem',
    height: 'calc(80vh - 100px)', 
  };

  const headerCellStyle = {
    border: '1px solid #E5E7EB',
    fontWeight: 'bold',
    backgroundColor: '#1976D2',
    color: 'white',
    padding: '0.6rem 0.4rem',
    fontSize: '0.85rem',
  };

  const timeLabelStyle = {
    border: '1px solid #E5E7EB',
    backgroundColor: '#F3F4F6',
    color: '#1F2937',
    padding: '0.6rem 0.4rem',
    fontSize: '0.8rem',
    fontWeight: '500',
  };

  const cellStyle = {
    border: '1px solid #E5E7EB',
    backgroundColor: '#FFFFFF',
    padding: '0.25rem',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1, 
  };

  const courseBlockStyle = (topPercent, heightPercent, colorIndex) => {
    const colors = ['#6395e6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];
    return {
      backgroundColor: colors[colorIndex % colors.length],
      color: 'white',
      padding: '0.25rem 0.3rem',
      borderRadius: '4px',
      fontSize: '0.65rem',
      fontWeight: '600',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      lineHeight: '1.1',
      position: 'absolute',
      top: `${topPercent}%`,
      height: `${heightPercent}%`,
      left: '2px',
      right: '2px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1px solid rgba(0,0,0,0.1)',
      cursor: 'pointer',
    };
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
    transition: 'background-color 0.2s',
    alignSelf: 'flex-start',
    marginLeft: '1.25rem',
    marginBottom: '1.25rem',
  };

  const subHeadingStyle = {
    color: '#6B7280',
    fontSize: '0.9rem',
    marginTop: '-0.5rem',
    marginBottom: '1rem',
    fontStyle: 'italic',
  };

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  // Function to format hour as 12-hour time
  const formatHour = (hour) => {
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
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

  const formatTimeRange = (time) => {
    if (!time) return 'TBA';
    const startHour = time.hour;
    const startMinute = time.minute;
    const startTimeInMinutes = startHour * 60 + startMinute;
    const endTimeInMinutes = startTimeInMinutes + time.minutesLong;
    const endHour = Math.floor(endTimeInMinutes / 60) % 24;
    const endMinute = endTimeInMinutes % 60;
    return `${formatTime(startHour, startMinute)} - ${formatTime(endHour, endMinute)}`;
  };

  

  // Determine if the current hour block is the first one for this course session
  const shouldShowInfo = (dayTime, currentHour) => {
    if (!dayTime) return false;
    const startHour = dayTime.hour;
    return startHour === currentHour;
  };

  // Get courses for a specific day and hour
  const getCoursesForCell = (dayName, hour) => {
    return courses.filter(course => {
      if (!course.meetingTimes || course.meetingTimes.length === 0) return false;
      return course.meetingTimes.some(time => {
        if (time.day !== dayName) return false;
        
        const startMinutes = time.hour * 60 + time.minute;
        const endMinutes = startMinutes + time.minutesLong;
        
        // Check if course overlaps with this hour block (hour:00 to (hour+1):00)
        const hourStartMinutes = hour * 60;
        const hourEndMinutes = (hour + 1) * 60;
        
        return startMinutes < hourEndMinutes && endMinutes > hourStartMinutes;
      });
    });
  };

  // Calculate the position and height of a course within an hour block as percentages
  const getCourseBlockDimensions = (course, dayName, hour) => {
    const dayTime = course.meetingTimes.find(t => {
      if (t.day !== dayName) return false;
      const startMinutes = t.hour * 60 + t.minute;
      const endMinutes = startMinutes + t.minutesLong;
      return startMinutes < (hour + 1) * 60 && endMinutes > hour * 60;
    });
    if (!dayTime) return null;
    
    const startMinutes = dayTime.hour * 60 + dayTime.minute;
    const endMinutes = startMinutes + dayTime.minutesLong;
    
    const hourStartMinutes = hour * 60;
    const hourEndMinutes = (hour + 1) * 60;
    
    // Calculate the position within this hour (0-100%)
    const blockStartMinutes = Math.max(startMinutes, hourStartMinutes);
    const blockEndMinutes = Math.min(endMinutes, hourEndMinutes);
    
    const topPercent = ((blockStartMinutes - hourStartMinutes) / 60) * 100;
    const heightPercent = ((blockEndMinutes - blockStartMinutes) / 60) * 100;
    
    return { topPercent, heightPercent, dayTime };
  };

  if (isLoading) {
    // A simple loading state within the modal
    return <div style={overlayStyle} onClick={closeModal}><div style={modalStyle}><div style={contentStyle}>Loading schedule...</div></div></div>;
  }

  if (error) {
    return <div style={overlayStyle} onClick={closeModal}><div style={modalStyle}><div style={contentStyle}>Error: {error}</div></div></div>;
  }
  return (
    <>
      <div style={overlayStyle} onClick={closeModal}></div>
      <div style={modalStyle}>
        <div style={contentStyle}>
          <h2 style={headingStyle}>Weekly Schedule</h2>
          <div style={subHeadingStyle}>
          Click on any course block for more details
        </div>
          <div style={gridContainerStyle}>
            
            {/* Top-left empty corner */}
            <div style={headerCellStyle}></div>

            {/* Day headers */}
            {days.map(day => (
              <div key={day} style={headerCellStyle}>
                {day}
              </div>
            ))}

            {/* Time labels and empty cells */}
            {hours.map(hour => (
              <React.Fragment key={`hour-${hour}`}>
                {/* Time label */}
                <div style={timeLabelStyle}>
                  {formatHour(hour)}
                </div>

                {/* Empty cells for each day */}
                {days.map(day => {
                  const cellCourses = getCoursesForCell(day, hour);
                  return (
                    <div key={`${day}-${hour}`} style={cellStyle}>
                      {cellCourses.map((course, idx) => {
                        const blockData = getCourseBlockDimensions(course, day, hour);
                        if (!blockData) return null;
                        const { topPercent, heightPercent, dayTime } = blockData;
                        
                        // Use index in the main list for consistent coloring across cells
                        const colorIndex = courses.indexOf(course);
                        
                        // Calculate continuity
                        const startTotalMinutes = dayTime.hour * 60 + dayTime.minute;
                        const endTotalMinutes = startTotalMinutes + dayTime.minutesLong;
                        const hourStartMinutes = hour * 60;
                        const hourEndMinutes = (hour + 1) * 60;

                        const continuesUp = startTotalMinutes < hourStartMinutes;
                        const continuesDown = endTotalMinutes > hourEndMinutes;

                        return (
                          <div 
                            key={idx} 
                            style={{
                              ...courseBlockStyle(topPercent, heightPercent, colorIndex),
                              ...(continuesUp ? { borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: 'none' } : {}),
                              ...(continuesDown ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' } : {}),
                            }}
                            onClick={() => setViewCourse(course)}
                            title={`${course.department} ${course.code} - ${course.professorNames?.join(', ') || 'TBA'}`}
                          >
                            {shouldShowInfo(dayTime, hour) && (
                                <div style={{fontWeight: 'bold', fontSize: '0.7rem'}}>{course.department} {course.code}{course.section ? `${course.section}` : ''}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>

        <button 
          onClick={closeModal} 
          style={buttonStyle}
          onMouseEnter={(e) => e.target.style.background = '#1565C0'}
          onMouseLeave={(e) => e.target.style.background = '#1976D2'}
        >
          Close
        </button>

        {viewCourse && <CourseDetailsModal course={viewCourse} onClose={() => setViewCourse(null)} />}
      </div>
    </>
  );
}

export default WeeklyScheduleModal;
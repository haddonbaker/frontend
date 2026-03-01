import React from 'react';

function WeeklyScheduleModal({ closeModal, courses = [] }) {
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
    gap: '0px',
    textAlign: 'center',
    marginBottom: '1rem',
    fontSize: '0.85rem',
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
    minHeight: '60px',
    backgroundColor: '#FFFFFF',
    padding: '0.25rem',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  };

  const courseBlockStyle = (topPercent, heightPercent, colorIndex) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
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

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
  
  // Function to format hour as 12-hour time
  const formatHour = (hour) => {
    if (hour === 0) return '12:00 AM';
    if (hour < 12) return `${hour}:00 AM`;
    if (hour === 12) return '12:00 PM';
    return `${hour - 12}:00 PM`;
  };
  
  const formatTimeStr = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes}${ampm}`;
  };

  const hours = Array.from({ length: 10 }, (_, i) => 8 + i); // 8am–5pm

  // Map day abbreviations to day names
  const dayMap = { M: 'Monday', T: 'Tuesday', W: 'Wednesday', R: 'Thursday', F: 'Friday' };

  // Determine if the current hour block is the largest (or first largest) for this course session
  const shouldShowInfo = (dayTime, currentHour) => {
    if (!dayTime) return false;
    const [sH, sM] = dayTime.start_time.split(':').map(Number);
    const [eH, eM] = dayTime.end_time.split(':').map(Number);
    const startTotal = sH * 60 + sM;
    const endTotal = eH * 60 + eM;

    let maxDuration = -1;
    let bestHour = -1;

    for (const h of hours) {
      const hStart = h * 60;
      const hEnd = (h + 1) * 60;
      const overlapStart = Math.max(startTotal, hStart);
      const overlapEnd = Math.min(endTotal, hEnd);
      const duration = Math.max(0, overlapEnd - overlapStart);

      if (duration > maxDuration) {
        maxDuration = duration;
        bestHour = h;
      }
    }

    return bestHour === currentHour;
  };

  // Get courses for a specific day and hour
  const getCoursesForCell = (dayName, hour) => {
    return courses.filter(course => {
      if (!course.times || course.times.length === 0) return false;
      return course.times.some(time => {
        const dayMatch = dayMap[time.day] === dayName;
        if (!dayMatch) return false;
        
        // Convert time strings to minutes
        const [startH, startM] = time.start_time.split(':').map(Number);
        const [endH, endM] = time.end_time.split(':').map(Number);
        
        const startMinutes = startH * 60 + startM;
        const endMinutes = endH * 60 + endM;
        
        // Check if course overlaps with this hour block (hour:00 to (hour+1):00)
        const hourStartMinutes = hour * 60;
        const hourEndMinutes = (hour + 1) * 60;
        
        return startMinutes < hourEndMinutes && endMinutes > hourStartMinutes;
      });
    });
  };

  // Calculate the position and height of a course within an hour block as percentages
  const getCourseBlockDimensions = (course, dayName, hour) => {
    const dayTime = course.times.find(t => {
      if (dayMap[t.day] !== dayName) return false;
      const [sH, sM] = t.start_time.split(':').map(Number);
      const [eH, eM] = t.end_time.split(':').map(Number);
      return (sH * 60 + sM) < (hour + 1) * 60 && (eH * 60 + eM) > hour * 60;
    });
    if (!dayTime) return null;
    
    const [startH, startM] = dayTime.start_time.split(':').map(Number);
    const [endH, endM] = dayTime.end_time.split(':').map(Number);
    
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    
    const hourStartMinutes = hour * 60;
    const hourEndMinutes = (hour + 1) * 60;
    
    // Calculate the position within this hour (0-100%)
    const blockStartMinutes = Math.max(startMinutes, hourStartMinutes);
    const blockEndMinutes = Math.min(endMinutes, hourEndMinutes);
    
    const topPercent = ((blockStartMinutes - hourStartMinutes) / 60) * 100;
    const heightPercent = ((blockEndMinutes - blockStartMinutes) / 60) * 100;
    
    return { topPercent, heightPercent, dayTime };
  };

  return (
    <>
      <div style={overlayStyle} onClick={closeModal}></div>
      <div style={modalStyle}>
        <div style={contentStyle}>
          <h2 style={headingStyle}>Weekly Schedule</h2>
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
                        const [startH, startM] = dayTime.start_time.split(':').map(Number);
                        const [endH, endM] = dayTime.end_time.split(':').map(Number);
                        const startTotalMinutes = startH * 60 + startM;
                        const endTotalMinutes = endH * 60 + endM;
                        const hourStartMinutes = hour * 60;
                        const hourEndMinutes = (hour + 1) * 60;

                        const continuesUp = startTotalMinutes < hourStartMinutes;
                        const continuesDown = endTotalMinutes > hourEndMinutes;

                        const timeLabel = dayTime ? `${formatTimeStr(dayTime.start_time)} - ${formatTimeStr(dayTime.end_time)}` : '';

                        return (
                          <div 
                            key={idx} 
                            style={{
                              ...courseBlockStyle(topPercent, heightPercent, colorIndex),
                              ...(continuesUp ? { borderTopLeftRadius: 0, borderTopRightRadius: 0, borderTop: 'none' } : {}),
                              ...(continuesDown ? { borderBottomLeftRadius: 0, borderBottomRightRadius: 0, borderBottom: 'none' } : {}),
                            }}
                            title={`${course.subject} ${course.number} - ${course.faculty?.join(', ') || 'TBA'}`}
                          >
                            {shouldShowInfo(dayTime, hour) && (
                              <>
                                <div style={{fontWeight: 'bold', fontSize: '0.7rem'}}>{course.subject} {course.number}</div>
                                <div style={{fontSize: '0.65rem'}}>{timeLabel}</div>
                                <div style={{fontSize: '0.65rem', fontStyle: 'italic'}}>{course.location}</div>
                              </>
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
      </div>
    </>
  );
}

export default WeeklyScheduleModal;
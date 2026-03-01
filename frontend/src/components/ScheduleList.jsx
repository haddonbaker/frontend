// src/components/ScheduleList.jsx
import React, { useState, useEffect } from 'react';

function ScheduleList() {
  const [schedule, setSchedule] = useState([]);
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Stub: Fetch available courses from backend
    const fetchCourses = async () => {
      console.log('Fetching courses from backend...');
      // const response = await fetch('/api/courses');
      // setCourses(await response.json());
    };

    // Stub: Fetch current schedule from backend
    const fetchSchedule = async () => {
      console.log('Fetching schedule from backend...');
      // const response = await fetch('/api/schedule');
      // setSchedule(await response.json());
    };

    fetchCourses();
    fetchSchedule();
  }, []);

  const panelStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '1.25rem',
    background: '#FFFFFF',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
  };

  const headingStyle = {
    color: '#1976D2',
    fontSize: '1.25rem',
    marginTop: 0,
    marginBottom: '0.75rem',
  };

  const subHeadingStyle = {
    color: '#1976D2',
    fontSize: '1.05rem',
    marginTop: '1rem',
    marginBottom: '0.75rem',
  };

  const listStyle = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  };

  const listItemStyle = {
    padding: '0.6rem',
    marginBottom: '0.4rem',
    background: '#F3F4F6',
    borderLeft: '4px solid #1976D2',
    borderRadius: '4px',
    color: '#1F2937',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.9rem',
  };

  const buttonStyle = {
    marginLeft: '10px',
    padding: '0.4rem 0.8rem',
    background: '#1976D2',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: '500',
    transition: 'background-color 0.2s',
    whiteSpace: 'nowrap',
  };

  const addCourse = async (course) => {
    // Stub: Call backend to add course. The backend will handle conflict checks.
    console.log('Attempting to add course to backend schedule...');
    // const response = await fetch('/api/schedule/add', {
    //   method: 'POST',
    //   body: JSON.stringify(course),
    //   headers: { 'Content-Type': 'application/json' }
    // });
    // const result = await response.json();
    // // Expected result: { success: boolean, schedule: [...], message?: string, suggestions?: [] }

    // Mocking a successful response for now.
    const result = { success: true, schedule: [...schedule, course] };

    if (result.success) {
      setSchedule(result.schedule);
    } else {
      // If there was a conflict, the backend would return success: false and a message/suggestions.
      window.alert(`Failed to add course: ${result.message || 'A conflict was detected.'} Suggestions: ${result.suggestions?.join(', ')}`);
    }
  };

  return (
    <div style={panelStyle}>
      <h2 style={headingStyle}>Candidate Schedule</h2>
      <ul style={listStyle}>
        {schedule.map((course) => (
          <li key={course.referenceNumber} style={listItemStyle}>
            {course.courseCode} - {course.courseName} ({course.professorName})
          </li>
        ))}
      </ul>

      <h3 style={subHeadingStyle}>All Courses</h3>
      <ul style={listStyle}>
        {courses.map((course) => (
          <li key={course.referenceNumber} style={listItemStyle}>
            <span>{course.courseCode} - {course.courseName} ({course.professorName})</span>
            <button 
              style={buttonStyle}
              onMouseEnter={(e) => e.target.style.background = '#1565C0'}
              onMouseLeave={(e) => e.target.style.background = '#1976D2'}
              onClick={() => addCourse(course)}
            >
              Add
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ScheduleList;
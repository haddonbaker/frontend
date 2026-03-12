import React, { useState, useEffect } from 'react';
import SearchPanel from './components/SearchPanel';
import SearchResults from './components/SearchResults.jsx';
import CandidateSchedule from './components/CandidateSchedule.jsx';
import WeeklyScheduleModal from './components/WeeklyScheduleModal';
import * as api from './apiService';


function App() {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [candidateSchedule, setCandidateSchedule] = useState({ courses: [], totalCredits: 0 });
  const [isLoading, setIsLoading] = useState(false); // Start with loading true
  const [error, setError] = useState(null);

  // Fetch initial schedule on component mount
  // useEffect(() => {
  //   const loadInitialData = async () => {
  //     setIsLoading(true);
  //     setError(null);
  //     try {
  //       const schedule = await api.getSchedule();
  //       setCandidateSchedule(schedule);
  //     } catch (err) {
  //       setError(err.message);
  //       // Display a more user-friendly error
  //       alert(`Failed to load schedule: ${err.message}`);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };
  //   loadInitialData();
  // }, []);

  const handleSearch = async (query, filters) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await api.searchCourses(query, filters);
      setSearchResults(results);
    } catch (err) {
      setError(err.message);
      alert(`Search failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCourse = async (course) => {
    try {
      // 1. POST to add the course to the schedule
      await api.addCourseToSchedule(candidateSchedule, course);
      // 2. GET the newly updated schedule from the backend
      const updatedSchedule = await api.getSchedule();
      setCandidateSchedule(updatedSchedule);
    } catch (err) {
      // The backend should send back a meaningful error message
      alert(`Error adding course: ${err.message}`);
      setError(err.message);
    }
  };

  const handleRemoveCourse = async (courseToRemove) => {
    try {
      // 1. DELETE to remove the course from the schedule
      await api.removeCourseFromSchedule(candidateSchedule, courseToRemove);
      // 2. GET the newly updated schedule from the backend
      const updatedSchedule = await api.getSchedule();
      setCandidateSchedule(updatedSchedule);
    } catch (err) {
      alert(`Error removing course: ${err.message}`);
      setError(err.message);
    }
  };

  const containerStyle = {
    padding: '1rem 0.75rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    maxWidth: '1200px',
    margin: '0 auto',
    background: '#F8FAFC',
    minHeight: '100vh',
  }; 

  // A simple loading/error display
  if (isLoading && !searchResults.length && !candidateSchedule.courses.length) {
    return <div style={{...containerStyle, justifyContent: 'center', alignItems: 'center'}}>Loading...</div>;
  }
  if (error) {
    // A more robust error display could be implemented here
    console.error("Vite App Error:", error);
  }

  return (
    <div style={containerStyle}>
      
      {/* Top: Course Search */}
      <SearchPanel onSearch={handleSearch} />

      {/* Middle: Search Results */}
      <SearchResults 
        results={searchResults} 
        onAddCourse={handleAddCourse}
      />

      {/* Bottom: Candidate Schedule */}
      <CandidateSchedule 
        courses={candidateSchedule.courses}
        onRemoveCourse={handleRemoveCourse}
        openModal={() => setShowScheduleModal(true)} 
      />

      {/* Weekly Schedule Popup */}
      {showScheduleModal && <WeeklyScheduleModal closeModal={() => setShowScheduleModal(false)} courses={candidateSchedule.courses} />}
    </div>
  );
}

export default App;
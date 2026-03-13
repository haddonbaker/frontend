import React, { useState, useEffect } from 'react';
import SearchPanel from './components/SearchPanel';
import SearchResults from './components/SearchResults.jsx';
import CandidateSchedule from './components/CandidateSchedule.jsx';
import WeeklyScheduleModal from './components/WeeklyScheduleModal';
import { NotificationProvider, useNotification } from './components/Notification.jsx';
import * as api from './apiService';


function AppContent() {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [candidateSchedule, setCandidateSchedule] = useState({ courses: [], totalCredits: 0 });
  const [isLoading, setIsLoading] = useState(false); // Start with loading true
  const [searchPerformed, setSearchPerformed] = useState(false);
  // TODO: Replace with actual student data from login/context
  const [student, setStudent] = useState({ id: '12345', name: 'Test Student' });
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  // Fetch initial schedule on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const schedule = await api.getSchedule();
        setCandidateSchedule(schedule);
      } catch (err) {
        setError(err.message);
        // Display a more user-friendly error
        showNotification(`Failed to load schedule: ${err.message}`, 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleSearch = async (query, filters) => {
    // logic for a spinner, better UX
    const startTime = Date.now();
    setIsLoading(true);
    setSearchPerformed(true);
    setError(null);
    try {
      const results = await api.searchCourses(query, filters);
      setSearchResults(results);
    } catch (err) {
      setError(err.message);
      showNotification(`Search failed: ${err.message}`, 'error');
    } finally {
      const elapsedTime = Date.now() - startTime;
      // add a delay so the user actually sees that something is happening, even if the API is very fast
      const minDelay = 500; // half a second
      if (elapsedTime < minDelay) {
        setTimeout(() => setIsLoading(false), minDelay - elapsedTime);
      } else {
        setIsLoading(false);
      }
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
      showNotification(`Error adding course: ${err.message}`, 'error');
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
      showNotification(`Error removing course: ${err.message}`, 'error');
      setError(err.message);
    }
  };

  const containerStyle = {
    padding: '1rem 1.5rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    display: 'flex',
    gap: '1.5rem',
    width: '100%',
    margin: 0,
    background: '#F8FAFC',
    height: '100vh',
  }; 

  const leftPanelStyle = {
    flex: '2 1 0%',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    minWidth: 0,
  };

  const rightPanelStyle = {
    flex: 'flex: 0 0 auto',
    marginRight: "2rem"
  };

  const searchResultsWrapperStyle = {
    flex: 1,
    overflowY: 'auto',
    minHeight: 0,
  };

  return (
    <div style={containerStyle}>
      <div style={leftPanelStyle}>
        {/* Top-Left: Course Search */}
        <SearchPanel onSearch={handleSearch} />

        {/* Bottom-Left: Search Results (scrollable) */}
        <div style={searchResultsWrapperStyle}>
          <SearchResults 
            results={searchResults} 
            onAddCourse={handleAddCourse}
            searchPerformed={searchPerformed}
            isLoading={isLoading}
          />
        </div>
      </div>

      <div style={rightPanelStyle}>
        <CandidateSchedule 
          schedule={candidateSchedule}
          student={student}
          onRemoveCourse={handleRemoveCourse}
          openModal={() => setShowScheduleModal(true)} 
        />
      </div>

      {/* Weekly Schedule Popup */}
      {showScheduleModal && 
        <WeeklyScheduleModal 
        closeModal={() => setShowScheduleModal(false)} 
        schedule={candidateSchedule} 
        />
      }
    </div>
  );
}

function App() {
  return (
    <NotificationProvider>
      <AppContent />
    </NotificationProvider>
  );
}

export default App;
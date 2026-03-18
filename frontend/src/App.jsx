/**
 * App.jsx
 * Author: Haddon Baker
 * Description: The main application component that orchestrates the search panel, search results, candidate schedule, and modals.
 */
import React, { useState, useEffect } from 'react';
import SearchPanel from './components/SearchPanel';
import SearchResults from './components/SearchResults.jsx';
import CandidateSchedule from './components/CandidateSchedule.jsx';
import WeeklyScheduleModal from './components/WeeklyScheduleModal';
import AlternativesModal from './components/SuggestAlternatives';
import { NotificationProvider, useNotification, Notification } from './components/Notification.jsx';
import * as api from './apiService';



function AppContent() {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [candidateSchedule, setCandidateSchedule] = useState({ courses: [], totalCredits: 0 });
  const [isLoading, setIsLoading] = useState(false); // Start with loading true
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [conflictData, setConflictData] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [showAlternativesModal, setShowAlternativesModal] = useState(false);

  const [student, setStudent] = useState({ id: '12345', name: 'Test Student' }); // In a real app, you'd get this from auth context or a user profile API
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
      setConflictData({ course, error: err.message });
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

  // for the clear results button
  const handleClearResults = () => {
    setSearchResults([]);
    setSearchPerformed(false);
  };

  const handleSuggestAlternatives = async () => {
    if (!conflictData || !conflictData.course) return;
    setIsLoading(true);
    try {
      const result = await api.suggestAlternatives(conflictData.course, candidateSchedule);
      setAlternatives(result);
      setShowAlternativesModal(true);
      setConflictData(null); // Close the notification
    } catch (error) {
      showNotification(`Failed to fetch alternatives: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // styles 
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
            onClearResults={handleClearResults}
          />
        </div>
      </div>

      <div style={rightPanelStyle}>
        {/* Top-Right: Candidate Schedule */}
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

      {conflictData && (
        <Notification
          message={conflictData.error || `Error adding ${conflictData.course.name || conflictData.course.courseCode}`}
          type="error"
          onClose={() => setConflictData(null)}
        >
          <button
            onClick={handleSuggestAlternatives}
            style={{
              padding: '0.3rem 0.6rem',
              marginLeft: '0.5rem',
              background: 'rgba(255, 255, 255, 0.2)',
              border: '1px solid rgba(255, 255, 255, 0.5)',
              color: 'white',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}>
            Suggest other courses
          </button>
        </Notification>
      )}

      {showAlternativesModal && (
        <AlternativesModal
          alternatives={alternatives}
          onClose={() => setShowAlternativesModal(false)}
          onAddCourse={handleAddCourse}
        />
      )}
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
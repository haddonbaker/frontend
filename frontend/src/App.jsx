import React, { useState, useEffect } from 'react';
import SearchPanel from './components/SearchPanel';
import SearchResults from './components/SearchResults.jsx';
import CandidateSchedule from './components/CandidateSchedule.jsx';
import WeeklyScheduleModal from './components/WeeklyScheduleModal';
import dummyData from '../dummy_data.json';

function App() {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState([]);

  // Load dummy data on mount to simulate search results
  useEffect(() => {
    setSearchResults(dummyData.classes);
  }, []);

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

  return (
    <div style={containerStyle}>
      
      {/* Top: Course Search */}
      <SearchPanel />

      {/* Middle: Search Results */}
      <SearchResults 
        results={searchResults} 
        onAddCourse={(course) => setSelectedCourses([...selectedCourses, course])}
      />

      {/* Bottom: Candidate Schedule */}
      <CandidateSchedule 
        courses={selectedCourses}
        onRemoveCourse={(index) => setSelectedCourses(selectedCourses.filter((_, i) => i !== index))}
        openModal={() => setShowScheduleModal(true)} 
      />

      {/* Weekly Schedule Popup */}
      {showScheduleModal && <WeeklyScheduleModal closeModal={() => setShowScheduleModal(false)} courses={selectedCourses} />}
    </div>
  );
}

export default App;
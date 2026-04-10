/**
 * App.jsx
 * Author: Haddon Baker
 * Description: The main application component that orchestrates the search panel, search results, candidate schedule, and modals.
 */
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import SearchPanel from './components/SearchPanel';
import SearchResults from './components/SearchResults.jsx';
import CandidateSchedule from './components/CandidateSchedule.jsx';
import WeeklyScheduleModal from './components/WeeklyScheduleModal';
import AlternativesModal from './components/SuggestAlternatives';
import { NotificationProvider, useNotification, Notification } from './components/Notification.jsx';
import StatusSheets from './components/StatusSheets.jsx';
import * as api from './apiService';

const BASE_URL = 'http://localhost:7000';

// Display-friendly labels for each semester enum value
const SEMESTER_LABELS = {
  Spring: 'Spring',
  EarlySummer: 'Early Summer',
  LateSummer: 'Late Summer',
  WinterOnline: 'Winter Online',
  Fall: 'Fall',
};


function AppContent() {
  const [page, setPage] = useState('search'); // 'search' | 'statusSheets'
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [candidateSchedule, setCandidateSchedule] = useState({ courses: [], totalCredits: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [conflictData, setConflictData] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [showAlternativesModal, setShowAlternativesModal] = useState(false);
  const [alternativeSource, setAlternativeSource] = useState(null);

  // Term selection: semester enum name + year integer
  const [selectedSemester, setSelectedSemester] = useState('Fall');
  const [selectedYear, setSelectedYear] = useState(null); // null until loaded
  const [termOptions, setTermOptions] = useState([]); // [{ value: "Fall_2024", label: "Fall 2024", semester: "Fall", year: 2024 }]

  const [student, setStudent] = useState({ id: '12345', name: 'Test Student' });
  const [error, setError] = useState(null);
  const [termDropdownOpen, setTermDropdownOpen] = useState(false);
  const termDropdownRef = useRef(null);
  const searchPanelRef = useRef(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (termDropdownRef.current && !termDropdownRef.current.contains(e.target)) {
        setTermDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch only terms that actually have courses
  useEffect(() => {
    const fetchTermOptions = async () => {
      try {
        const res = await fetch(`${BASE_URL}/terms`);
        const terms = res.ok ? await res.json() : [];

        // terms is already sorted chronologically from the backend
        // each entry is like "Fall_2024" or "EarlySummer_2023"
        const options = terms.map(term => {
          const idx = term.indexOf('_');
          const semester = term.slice(0, idx);
          const year = parseInt(term.slice(idx + 1), 10);
          return {
            value: term,
            label: `${SEMESTER_LABELS[semester] ?? semester} ${year}`,
            semester,
            year,
          };
        });

        setTermOptions(options);

        // Default to the last option (most recent term)
        if (options.length > 0) {
          const last = options[options.length - 1];
          setSelectedSemester(last.semester);
          setSelectedYear(last.year);
        }
      } catch (err) {
        console.error('Failed to fetch term options:', err);
      }
    };
    fetchTermOptions();
  }, []);

  // Fetch schedule whenever the selected term changes
  useEffect(() => {
    if (selectedYear === null) return; // wait until year is loaded
    const loadSchedule = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const schedule = await api.getSchedule(selectedSemester, selectedYear);
        setCandidateSchedule(schedule);
      } catch (err) {
        setError(err.message);
        showNotification(`Failed to load schedule: ${err.message}`, 'error');
      } finally {
        setIsLoading(false);
      }
    };
    loadSchedule();
  }, [selectedSemester, selectedYear]);

  const handleTermChange = (value) => {
    const option = termOptions.find(o => o.value === value);
    if (!option) return;
    setSelectedSemester(option.semester);
    setSelectedYear(option.year);
    setSearchResults([]);
    setSearchPerformed(false);
    searchPanelRef.current?.clear();
  };

  const handleSearch = async (query, filters) => {
    // Inject the selected semester and year automatically — invisible to the user
    const filtersWithTerm = {
      ...filters,
      semesters: [selectedSemester],
      years: [selectedYear],
    };

    const startTime = Date.now();
    setIsLoading(true);
    setSearchPerformed(true);
    setError(null);
    try {
      const results = await api.searchCourses(query, filtersWithTerm);
      setSearchResults(results);
    } catch (err) {
      setError(err.message);
      showNotification(`Search failed: ${err.message}`, 'error');
    } finally {
      const elapsedTime = Date.now() - startTime;
      const minDelay = 500;
      if (elapsedTime < minDelay) {
        setTimeout(() => setIsLoading(false), minDelay - elapsedTime);
      } else {
        setIsLoading(false);
      }
    }
  };

  const handleAddCourse = async (course) => {
    try {
      await api.addCourseToSchedule(candidateSchedule, course, selectedSemester, selectedYear);
      const updatedSchedule = await api.getSchedule(selectedSemester, selectedYear);
      setCandidateSchedule(updatedSchedule);
    } catch (err) {
      setConflictData({ course, error: err.message });
    }
  };

  const handleRemoveCourse = async (courseToRemove) => {
    try {
      await api.removeCourseFromSchedule(candidateSchedule, courseToRemove, selectedSemester, selectedYear);
      const updatedSchedule = await api.getSchedule(selectedSemester, selectedYear);
      setCandidateSchedule(updatedSchedule);
    } catch (err) {
      showNotification(`Error removing course: ${err.message}`, 'error');
      setError(err.message);
    }
  };

  const handleClearResults = () => {
    setSearchResults([]);
    setSearchPerformed(false);
    searchPanelRef.current?.clear();
  };

  const handleSuggestAlternatives = async () => {
    if (!conflictData || !conflictData.course) return;
    setIsLoading(true);
    try {
      const result = await api.suggestAlternatives(conflictData.course, candidateSchedule, selectedSemester, selectedYear);
      setAlternatives(result);
      setAlternativeSource(conflictData.course);
      setShowAlternativesModal(true);
      setConflictData(null);
    } catch (error) {
      showNotification(`Failed to fetch alternatives: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // styles
  const rootStyle = {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const containerStyle = {
    padding: '1rem 1.5rem',
    fontFamily: 'system-ui, -apple-system, sans-serif',
    display: 'flex',
    gap: '1.5rem',
    width: '100%',
    margin: 0,
    background: '#F8FAFC',
    flex: 1,
    minHeight: 0,
    boxSizing: 'border-box',
    alignItems: 'stretch',
  };

  const leftPanelStyle = {
    flex: '2 1 0%',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    minWidth: 0,
    minHeight: 0,
  };

  const rightPanelStyle = {
    flex: '0 0 auto',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  };

  const searchResultsWrapperStyle = {
    flex: 1,
    overflowY: 'auto',
    minHeight: 0,
  };

  const navStyle = {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center',
    padding: '0.5rem 1.5rem',
    background: '#fff',
    borderBottom: '1px solid #E2E8F0',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  const navTabStyle = (active) => ({
    padding: '0.4rem 1rem',
    borderRadius: '6px',
    border: 'none',
    background: active ? '#EFF6FF' : 'transparent',
    color: active ? '#3B82F6' : '#64748B',
    fontWeight: active ? 600 : 400,
    fontSize: '0.875rem',
    cursor: 'pointer',
  });

  const selectedTermValue = selectedYear !== null ? `${selectedSemester}_${selectedYear}` : '';
  const selectedTermLabel = termOptions.find(o => o.value === selectedTermValue)?.label ?? 'Select term';

  const termSelector = (
    <div ref={termDropdownRef} style={{ position: 'relative', marginLeft: 'auto' }}>
      <button
        onClick={() => setTermDropdownOpen(o => !o)}
        disabled={termOptions.length === 0}
        style={{
          padding: '0.5rem 0.75rem',
          borderRadius: '6px',
          border: `2px solid ${termDropdownOpen ? '#1976D2' : '#E5E7EB'}`,
          background: '#FFFFFF',
          color: '#1F2937',
          fontSize: '0.875rem',
          fontWeight: 500,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontFamily: 'inherit',
          minWidth: '140px',
          justifyContent: 'space-between',
          transition: 'border-color 0.2s',
        }}
      >
        <span>{selectedTermLabel}</span>
        <ChevronDown size={16} style={{ transform: termDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </button>
      {termDropdownOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: '0.25rem',
          background: '#FFFFFF',
          border: '2px solid #1976D2',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          zIndex: 20,
          minWidth: '100%',
          overflow: 'hidden',
        }}>
          {termOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => { handleTermChange(opt.value); setTermDropdownOpen(false); }}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                border: 'none',
                background: opt.value === selectedTermValue ? '#EFF6FF' : 'transparent',
                color: opt.value === selectedTermValue ? '#1976D2' : '#1F2937',
                fontSize: '0.875rem',
                fontWeight: opt.value === selectedTermValue ? 600 : 400,
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );

  const Nav = ({ activePage }) => (
    <div style={navStyle}>
      <button style={navTabStyle(activePage === 'search')} onClick={() => setPage('search')}>Course Search</button>
      <button style={navTabStyle(activePage === 'statusSheets')} onClick={() => setPage('statusSheets')}>Status Sheets</button>
    </div>
  );

  if (page === 'statusSheets') {
    return (
      <div style={rootStyle}>
        <Nav activePage="statusSheets" />
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <StatusSheets />
        </div>
      </div>
    );
  }

  return (
    <div style={rootStyle}>
    <Nav activePage="search" />
    <div style={containerStyle}>
      <div style={leftPanelStyle}>
        {/* Top-Left: Course Search */}
        <SearchPanel ref={searchPanelRef} onSearch={handleSearch} termSelector={termSelector} />

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
          selectedSemester={selectedSemester}
          selectedYear={selectedYear}
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
          course={alternativeSource}
          onClose={() => setShowAlternativesModal(false)}
          onAddCourse={handleAddCourse}
        />
      )}
    </div>
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

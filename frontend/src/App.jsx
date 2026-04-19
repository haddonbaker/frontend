/**
 * App.jsx
 * Author: Haddon Baker
 * Description: The main application component that orchestrates the search panel, search results, candidate schedule, and modals.
 */

import SearchPanel from './components/SearchPanel';
import SearchResults from './components/SearchResults.jsx';
import CandidateSchedule from './components/CandidateSchedule.jsx';
import WeeklyScheduleModal from './components/WeeklyScheduleModal';
import AlternativesModal from './components/SuggestAlternatives';
import { NotificationProvider, useNotification, Notification } from './components/Notification.jsx';
import StatusSheets from './components/StatusSheets.jsx';
import Professors from './components/Professors.jsx';
import LoginPage from './components/LoginPage.jsx';
import Profile from './components/Profile.jsx';
import * as api from './apiService';
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Moon, Sun, UserCircle } from 'lucide-react';

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
  const [isDark, toggleDark] = useDarkMode();
  const [page, setPage] = useState('search'); // 'search' | 'statusSheets' | 'profile'
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [candidateSchedule, setCandidateSchedule] = useState({ courses: [], totalCredits: 0 });
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [conflictData, setConflictData] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [showAlternativesModal, setShowAlternativesModal] = useState(false);
  const [alternativeSource, setAlternativeSource] = useState(null);

  // Term selection: semester enum name + year integer
  const [selectedSemester, setSelectedSemester] = useState('Fall');
  const [selectedYear, setSelectedYear] = useState(null); // null until loaded
  const [termOptions, setTermOptions] = useState([]); // [{ value: "Fall_2024", label: "Fall 2024", semester: "Fall", year: 2024 }]

  // authMode: 'login' | 'guest' | 'loggedIn'
  const [authMode, setAuthMode] = useState(() => {
    return localStorage.getItem('authMode') || 'login';
  });
  const [loggedInUser, setLoggedInUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('loggedInUser')); } catch { return null; }
  });

  const handleLogin = (user, goToProfile = false) => {
    setLoggedInUser(user);
    setAuthMode('loggedIn');
    localStorage.setItem('authMode', 'loggedIn');
    localStorage.setItem('loggedInUser', JSON.stringify(user));
    if (user.major) api.updateMajor(user.name, user.major).catch(() => {});
    if (goToProfile) setPage('profile');
  };

  const handleContinueAsGuest = () => {
    setAuthMode('guest');
    localStorage.setItem('authMode', 'guest');
  };

  const handleLogout = async () => {
    try { await api.logout(); } catch { /* session may already be gone */ }
    setCandidateSchedule({ courses: [], totalCredits: 0 });
    setLoggedInUser(null);
    setAuthMode('login');
    localStorage.removeItem('authMode');
    localStorage.removeItem('loggedInUser');
    setProfileOpen(false);
    setPage('search');
  };

  const handleSelectMajor = (newMajor) => {
    if (loggedInUser) {
      const updatedUser = { ...loggedInUser, major: newMajor };
      setLoggedInUser(updatedUser);
      localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
      api.updateMajor(loggedInUser.name, newMajor).catch(() => {});
    }
  };

  // On first load, verify the cached username still exists on the server
  // (guards against a deleted account or a fresh backend with no students/).
  useEffect(() => {
    if (authMode === 'loggedIn' && loggedInUser?.name) {
      api.getCurrentUser(loggedInUser.name).then(data => {
        // Sync major from server in case it changed since last session
        const updatedUser = { ...loggedInUser, major: data.major || '' };
        setLoggedInUser(updatedUser);
        localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
      }).catch(() => {
        setLoggedInUser(null);
        setAuthMode('login');
        localStorage.removeItem('authMode');
        localStorage.removeItem('loggedInUser');
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const [error, setError] = useState(null);
  const [termDropdownOpen, setTermDropdownOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const termDropdownRef = useRef(null);
  const profileRef = useRef(null);
  const searchPanelRef = useRef(null);
  const { showNotification } = useNotification();


  function useDarkMode() {
    const [isDark, setIsDark] = useState(() => {
      try {
        return JSON.parse(localStorage.getItem('darkMode')) ?? false;
      } catch {
        return false;
      }
    });

    useEffect(() => {
      document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
      localStorage.setItem('darkMode', JSON.stringify(isDark));
    }, [isDark]);

    const toggle = () => {
      const root = document.documentElement;
      root.classList.add('no-transition');
      setIsDark(d => !d);
      // Two rAFs: first lets React flush the state + useEffect, second lets the
      // browser apply the new styles — then we re-enable transitions.
      requestAnimationFrame(() => requestAnimationFrame(() => {
        root.classList.remove('no-transition');
      }));
    };

    return [isDark, toggle];
  }
  
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (termDropdownRef.current && !termDropdownRef.current.contains(e.target)) {
        setTermDropdownOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
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

  // Fetch schedule whenever the selected term or logged-in user changes
  useEffect(() => {
    if (selectedYear === null) return; // wait until year is loaded
    const loadSchedule = async () => {
      try {
        const schedule = await api.getSchedule(selectedSemester, selectedYear, loggedInUser?.name);
        setCandidateSchedule(schedule);
      } catch (err) {
        showNotification(`Failed to load schedule: ${err.message}`, 'error');
      }
    };
    loadSchedule();
  }, [selectedSemester, selectedYear, loggedInUser?.name]);

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
    setIsSearchLoading(true);
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
        setTimeout(() => setIsSearchLoading(false), minDelay - elapsedTime);
      } else {
        setIsSearchLoading(false);
      }
    }
  };

  const handleAddCourse = async (course) => {
    try {
      await api.addCourseToSchedule(candidateSchedule, course, selectedSemester, selectedYear, loggedInUser?.name);
      const updatedSchedule = await api.getSchedule(selectedSemester, selectedYear, loggedInUser?.name);
      setCandidateSchedule(updatedSchedule);
    } catch (err) {
      setConflictData({ course, error: err.message });
    }
  };

  const handleRemoveCourse = async (courseToRemove) => {
    try {
      await api.removeCourseFromSchedule(candidateSchedule, courseToRemove, selectedSemester, selectedYear, loggedInUser?.name);
      const updatedSchedule = await api.getSchedule(selectedSemester, selectedYear, loggedInUser?.name);
      setCandidateSchedule(updatedSchedule);
    } catch (err) {
      showNotification(`Error removing course: ${err.message}`, 'error');
    }
  };

  const handleClearResults = () => {
    setSearchResults([]);
    setSearchPerformed(false);
    searchPanelRef.current?.clear();
  };

  const handleSuggestAlternatives = async () => {
    if (!conflictData || !conflictData.course) return;
    try {
      const result = await api.suggestAlternatives(conflictData.course, candidateSchedule, selectedSemester, selectedYear, loggedInUser?.name);
      setAlternatives(result);
      setAlternativeSource(conflictData.course);
      setShowAlternativesModal(true);
      setConflictData(null);
    } catch (error) {
      showNotification(`Failed to fetch alternatives: ${error.message}`, 'error');
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
    background: 'var(--bg-page)',
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
    background: 'var(--bg-panel)',
    borderBottom: '1px solid var(--border-subtle)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  };

  const navTabStyle = (active) => ({
    padding: '0.4rem 1rem',
    borderRadius: '6px',
    border: 'none',
    background: active ? 'var(--bg-active-tab)' : 'transparent',
    color: active ? 'var(--primary-color)' : 'var(--text-secondary)',
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
          border: `2px solid ${termDropdownOpen ? 'var(--primary-color)' : 'var(--border-color)'}`,
          background: 'var(--bg-panel)',
          color: 'var(--text-primary)',
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
          background: 'var(--bg-panel)',
          border: '2px solid var(--primary-color)',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
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
                background: opt.value === selectedTermValue ? 'var(--bg-active-tab)' : 'transparent',
                color: opt.value === selectedTermValue ? 'var(--primary-color)' : 'var(--text-primary)',
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

  function renderNav(activePage) { return (
    <div style={navStyle}>
      <button style={navTabStyle(activePage === 'search')} onClick={() => setPage('search')}>Course Search</button>
      <button style={navTabStyle(activePage === 'statusSheets')} onClick={() => setPage('statusSheets')}>Status Sheets</button>
      <button style={navTabStyle(activePage === 'prof')} onClick={() => setPage('prof')}>Professors</button>
        <button style={navTabStyle(activePage === 'profile')} onClick={() => setPage('profile')}>Profile</button>
      <button
        onClick={toggleDark}
        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          marginLeft: 'auto',
          background: 'transparent',
          border: '1px solid var(--border-color)',
          borderRadius: '6px',
          padding: '0.35rem 0.6rem',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {isDark ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      {/* Profile icon */}
      <div ref={profileRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setProfileOpen(o => !o)}
          title="Profile"
          style={{
            background: profileOpen ? 'var(--bg-active)' : 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '0.35rem 0.6rem',
            cursor: 'pointer',
            color: authMode === 'loggedIn' ? 'var(--primary-color)' : 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <UserCircle size={16} />
        </button>

        {profileOpen && (
          <div style={{
            position: 'absolute',
            top: 'calc(100% + 0.4rem)',
            right: 0,
            background: 'var(--bg-panel)',
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            padding: '0.5rem',
            minWidth: '180px',
            zIndex: 30,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem',
          }}>
            {authMode === 'loggedIn' ? (
              <>
                {/* User name header */}
                <div style={{ padding: '0.4rem 0.6rem 0.6rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.25rem' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {loggedInUser?.name}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Logged in</p>
                </div>
                <button
                  onClick={() => { setPage('profile'); setProfileOpen(false); }}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.6rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  View Profile
                </button>
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    padding: '0.45rem 0.6rem',
                    borderRadius: '6px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--error-text)',
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'inherit',
                  }}
                >
                  Log Out
                </button>
              </>
            ) : (
              <button
                onClick={() => { setAuthMode('login'); setProfileOpen(false); }}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.6rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--primary-color)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontFamily: 'inherit',
                }}
              >
                Log In
              </button>
            )}

          </div>
        )}
      </div>
    </div>
  ); }

  if (authMode === 'login') {
    return <LoginPage onLogin={handleLogin} onContinueAsGuest={handleContinueAsGuest} />;
  }

  if (page === 'statusSheets') {
    return (
      <div style={rootStyle}>
        {renderNav('statusSheets')}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <StatusSheets />
        </div>
      </div>
    );
  }

  if (page === 'prof') {
    return (
      <div style={rootStyle}>
        {renderNav('prof')}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <Professors />
        </div>
      </div>
    );
  }
  if (page === 'profile') {
    return (
      <div style={rootStyle}>
        {renderNav('profile')}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <Profile
            user={loggedInUser || { name: 'Guest', major: 'Undeclared' }}
            onBack={() => setPage('search')}
            onSelectMajor={handleSelectMajor}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={rootStyle}>
    {renderNav('search')}
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
            isLoading={isSearchLoading}
            onClearResults={handleClearResults}
          />
        </div>
      </div>

      <div style={rightPanelStyle}>
        {/* Top-Right: Candidate Schedule */}
        <CandidateSchedule
          schedule={candidateSchedule}
          username={loggedInUser?.name}
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

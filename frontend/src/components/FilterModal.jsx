import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

function FilterModal({ onClose, onApply, onReset, isClosing = false }) {
  const [selectedDays, setSelectedDays] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedCredits, setSelectedCredits] = useState('Any');
  const [selectedProfessor, setSelectedProfessor] = useState('All');
  const [selectedYears, setSelectedYears] = useState([]);
  
  // Options loaded from API
  const [departments, setDepartments] = useState(['All']);
  const [credits, setCredits] = useState(['Any']);
  const [professors, setProfessors] = useState(['All']);
  const [years, setYears] = useState([]);
  
  const [daysDropdownOpen, setDaysDropdownOpen] = useState(false);
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const [creditsDropdownOpen, setCreditsDropdownOpen] = useState(false);
  const [profDropdownOpen, setProfDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [hoveredClose, setHoveredClose] = useState(false);
  const [closeTooltipPos, setCloseTooltipPos] = useState({ x: 0, y: 0 });
  const closeButtonRef = useRef(null);
  const deptRef = useRef(null);
  const creditsRef = useRef(null);
  const daysRef = useRef(null);
  const profRef = useRef(null);
  const yearsRef = useRef(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const BASEURL = 'http://localhost:7000'
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [deptRes, credRes, profRes, yearRes] = await Promise.all([
          fetch(`${BASEURL}/departments`),
          fetch(`${BASEURL}/credits`),
          fetch(`${BASEURL}/professors`),
          fetch(`${BASEURL}/years`)
        ]);

        if (deptRes.ok) {
          const data = await deptRes.json();
          setDepartments(['All', ...data]);
        }
        if (credRes.ok) {
          const data = await credRes.json();
          setCredits(['Any', ...data]);
        }
        if (profRes.ok) {
          const data = await profRes.json();
          setProfessors(['All', ...data]);
        }
        if (yearRes.ok) {
          const data = await yearRes.json();
          setYears(data);
        }
      } catch (error) {
        console.error("Failed to fetch filter options:", error);
      }
    };
    fetchFilterOptions();
  }, []);

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleYear = (year) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
  };

  const toggleDepartment = (dept) => {
    setSelectedDepartment(dept);
    setDeptDropdownOpen(false);
  };

  const toggleProfessor = (prof) => {
    setSelectedProfessor(prof);
    setProfDropdownOpen(false);
  };

  const toggleCredits = (credit) => {
    setSelectedCredits(credit);
    setCreditsDropdownOpen(false);
  };

  const handleCloseTooltip = () => {
    if (closeButtonRef?.current) {
      const rect = closeButtonRef.current.getBoundingClientRect();
      setCloseTooltipPos({
        x: rect.left + rect.width / 2,
        y: rect.top - 12,
      });
    }
  };

  const getSelectedDaysDisplay = () => {
    if (selectedDays.length === 0) return 'Select days...';
    if (selectedDays.length === days.length) return 'All days';
    if (selectedDays.length >= 1) return selectedDays.join(', ');
    return `${selectedDays.length} days selected`;
  };

  const getSelectedYearsDisplay = () => {
    if (selectedYears.length === 0) return 'Select years...';
    if (selectedYears.length === years.length) return 'All years';
    return selectedYears.join(', ');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deptDropdownOpen && deptRef.current && !deptRef.current.contains(event.target)) {
        setDeptDropdownOpen(false);
      }
      if (creditsDropdownOpen && creditsRef.current && !creditsRef.current.contains(event.target)) {
        setCreditsDropdownOpen(false);
      }
      if (daysDropdownOpen && daysRef.current && !daysRef.current.contains(event.target)) {
        setDaysDropdownOpen(false);
      }
      if (profDropdownOpen && profRef.current && !profRef.current.contains(event.target)) {
        setProfDropdownOpen(false);
      }
      if (yearDropdownOpen && yearsRef.current && !yearsRef.current.contains(event.target)) {
        setYearDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [deptDropdownOpen, creditsDropdownOpen, daysDropdownOpen, profDropdownOpen, yearDropdownOpen]);

  return (
    <div style={{
      ...styles.filtersPanel,
      animation: isClosing
        ? 'filterSlideUp 0.25s cubic-bezier(0.4, 0, 1, 1) forwards'
        : 'filterSlideDown 0.3s cubic-bezier(0, 0, 0.2, 1) forwards',
    }}>
      <div style={styles.title}>Filter by...</div>
      
      {/* Row 1: Department and Professor */}
      <div style={styles.row}>
        <div style={styles.filterColumn}>
          <label style={styles.label}>Department</label>
          <div style={styles.multiSelectWrapper} ref={deptRef}>
          <button
            onClick={() => setDeptDropdownOpen(!deptDropdownOpen)}
            style={{
              ...styles.multiSelectButton,
              borderColor: deptDropdownOpen ? '#1976D2' : '#E5E7EB',
            }}
          >
            <span>{selectedDepartment}</span>
            <ChevronDown
              size={18}
              style={{
                transform: deptDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          </button>

          {deptDropdownOpen && (
            <div style={styles.daysDropdown}>
              {departments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => toggleDepartment(dept)}
                  style={{
                    ...styles.dropdownOption,
                    background: selectedDepartment === dept ? '#E0E7FF' : 'transparent',
                    color: selectedDepartment === dept ? '#1976D2' : '#1F2937',
                  }}
                >
                  {dept}
                </button>
              ))}
            </div>
            )}
          </div>
        </div>

        <div style={styles.filterColumn}>
          <label style={styles.label}>Professor</label>
          <div style={styles.multiSelectWrapper} ref={profRef}>
            <button
              onClick={() => setProfDropdownOpen(!profDropdownOpen)}
              style={{
                ...styles.multiSelectButton,
                borderColor: profDropdownOpen ? '#1976D2' : '#E5E7EB',
              }}
            >
              <span>{selectedProfessor}</span>
              <ChevronDown
                size={18}
                style={{
                  transform: profDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}
              />
            </button>

            {profDropdownOpen && (
              <div style={styles.daysDropdown}>
                {professors.map((prof) => (
                  <button
                    key={prof}
                    onClick={() => toggleProfessor(prof)}
                    style={{
                      ...styles.dropdownOption,
                      background: selectedProfessor === prof ? '#E0E7FF' : 'transparent',
                      color: selectedProfessor === prof ? '#1976D2' : '#1F2937',
                    }}
                  >
                    {prof}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Credits and Days */}
      <div style={styles.row}>
        <div style={styles.filterColumn}>
          <label style={styles.label}>Credits</label>
          <div style={styles.multiSelectWrapper} ref={creditsRef}>
          <button
            onClick={() => setCreditsDropdownOpen(!creditsDropdownOpen)}
            style={{
              ...styles.multiSelectButton,
              borderColor: creditsDropdownOpen ? '#1976D2' : '#E5E7EB',
            }}
          >
            <span>{selectedCredits}</span>
            <ChevronDown
              size={18}
              style={{
                transform: creditsDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          </button>

          {creditsDropdownOpen && (
            <div style={styles.daysDropdown}>
              {credits.map((credit) => (
                <button
                  key={credit}
                  onClick={() => toggleCredits(credit)}
                  style={{
                    ...styles.dropdownOption,
                    background: selectedCredits === credit ? '#E0E7FF' : 'transparent',
                    color: selectedCredits === credit ? '#1976D2' : '#1F2937',
                  }}
                >
                  {credit}
                </button>
              ))}
            </div>
            )}
          </div>
        </div>

        <div style={styles.filterColumn}>
          <label style={styles.label}>Days</label>
          <div style={styles.multiSelectWrapper} ref={daysRef}>
          <button
            onClick={() => setDaysDropdownOpen(!daysDropdownOpen)}
            style={{
              ...styles.multiSelectButton,
              borderColor: daysDropdownOpen ? '#1976D2' : '#E5E7EB',
            }}
          >
            <span>{getSelectedDaysDisplay()}</span>
            <ChevronDown
              size={18}
              style={{
                transform: daysDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          </button>

          {daysDropdownOpen && (
            <div style={styles.daysDropdown}>
              {days.map((day) => (
                <label key={day} style={styles.daysCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedDays.includes(day)}
                    onChange={() => toggleDay(day)}
                    style={{ cursor: 'pointer' }}
                  />
                  {day}
                </label>
              ))}
            </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Years */}
      <div style={styles.filterRow}>
        <label style={styles.label}>Years</label>
        <div style={styles.multiSelectWrapper} ref={yearsRef}>
          <button
            onClick={() => setYearDropdownOpen(!yearDropdownOpen)}
            style={{
              ...styles.multiSelectButton,
              borderColor: yearDropdownOpen ? '#1976D2' : '#E5E7EB',
            }}
          >
            <span>{getSelectedYearsDisplay()}</span>
            <ChevronDown
              size={18}
              style={{
                transform: yearDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          </button>

          {yearDropdownOpen && (
            <div style={styles.daysDropdown}>
              {years.map((year) => (
                <label key={year} style={styles.daysCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={selectedYears.includes(year)}
                    onChange={() => toggleYear(year)}
                    style={{ cursor: 'pointer' }}
                  />
                  {year}
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={styles.filterRow}>
        <label style={styles.label}>Time Range</label>
        <div style={styles.timeRange}>
          <input type="time" style={styles.timeInput} />
          <span style={styles.timeSeparator}>to</span>
          <input type="time" style={styles.timeInput} />
        </div>
      </div>

      <div style={styles.buttonGroup}>
        <button
          style={styles.applyButton}
          onClick={() => onApply({
            days: selectedDays,
            department: selectedDepartment,
            credits: selectedCredits,
            professor: selectedProfessor,
            years: selectedYears,
            // TODO: Add time range when implemented
          })}
          onMouseEnter={(e) => e.target.style.background = '#1565C0'}
          onMouseLeave={(e) => e.target.style.background = '#1976D2'}
        >
          Apply Filters
        </button>
        <button
          style={styles.resetButton}
          onClick={onReset}
          onMouseEnter={(e) => e.target.style.background = '#E5E7EB'}
          onMouseLeave={(e) => e.target.style.background = '#F3F4F6'}
        >
          Reset
        </button>
      </div>

      <button
        ref={closeButtonRef}
        onClick={onClose}
        onMouseEnter={(e) => {
          handleCloseTooltip();
          setHoveredClose(true);
          e.target.style.color = '#1F2937';
        }}
        onMouseLeave={(e) => {
          setHoveredClose(false);
          e.target.style.color = '#6B7280';
        }}
        style={styles.closeButton}
        aria-label="Close filters"
      >
        <ChevronDown
          size={24}
          style={{
            transition: 'transform 0.3s ease-out',
          }}
        />
      </button>

      {hoveredClose && (
        <div
          style={{
            ...styles.closeTooltip,
            left: `${closeTooltipPos.x}px`,
            top: `${closeTooltipPos.y}px`,
          }}
        >
          Close
        </div>
      )}
    </div>
  );
}

const styles = {
  filtersPanel: {
    width: '100%',
    boxSizing: 'border-box',
    marginTop: '0.75rem',
    padding: '1.25rem',
    border: '1px solid #E5E7EB',
    borderRadius: '12px',
    background: '#FFFFFF',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    zIndex: 10,
    position: 'relative',
    paddingTop: '3rem',
  },
  title: {
    position: 'absolute',
    top: '1rem',
    left: '1.25rem',
    fontSize: '1.05rem',
    fontWeight: '600',
    color: '#1F2937',
  },
  row: {
    display: 'flex',
    gap: '1rem',
    width: '100%',
  },
  filterColumn: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    minWidth: 0,
  },
  filterRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#1F2937',
  },
  dropdownOption: {
    width: '100%',
    padding: '0.6rem 0.5rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s',
    textAlign: 'left',
    background: 'transparent',
  },
  multiSelectWrapper: {
    position: 'relative',
  },
  multiSelectButton: {
    width: '100%',
    padding: '0.6rem',
    borderRadius: '6px',
    border: '2px solid #E5E7EB',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'border 0.2s',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#FFFFFF',
    color: '#1F2937',
  },
  daysDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '0.25rem',
    background: '#FFFFFF',
    border: '2px solid #1976D2',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    padding: '0.5rem',
    maxHeight: '200px',   // limit height
    overflowY: 'auto',    // enable scroll
  },
  daysCheckboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.95rem',
    color: '#1F2937',
    cursor: 'pointer',
    padding: '0.4rem 0.5rem',
    borderRadius: '4px',
    transition: 'background 0.2s',
  },
  timeRange: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  timeInput: {
    flex: 1,
    padding: '0.6rem',
    borderRadius: '6px',
    border: '2px solid #E5E7EB',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  timeSeparator: {
    color: '#6B7280',
    fontSize: '0.9rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  applyButton: {
    flex: 1,
    padding: '0.75rem 1rem',
    background: '#1976D2',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.2s, box-shadow 0.2s',
  },
  resetButton: {
    flex: 1,
    padding: '0.75rem 1rem',
    background: '#F3F4F6',
    color: '#1F2937',
    border: '1px solid #D1D5DB',
    borderRadius: '8px',
    fontSize: '0.95rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  closeButton: {
    position: 'absolute',
    top: '0.85rem',
    right: '1.15rem',
    background: 'transparent',
    border: 'none',
    color: '#6B7280',
    cursor: 'pointer',
    transition: 'color 0.2s',
    padding: '0.5rem',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
  },
  closeTooltip: {
    position: 'fixed',
    transform: 'translate(-275%, -200%)',
    background: 'rgba(31, 41, 55, 0.95)',
    color: 'white',
    padding: '0.5rem 0.75rem',
    borderRadius: '4px',
    fontSize: '0.85rem',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: 1001,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
};

// Add CSS animations
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes filterSlideDown {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0px) scale(1);
    }
  }
  
  @keyframes filterSlideUp {
    from {
      opacity: 1;
      transform: translateY(0px) scale(1);
    }
    to {
      opacity: 0;
      transform: translateY(-20px) scale(0.98);
    }
  }
`;
if (!document.head.querySelector('style[data-filtermodal-animations="true"]')) {
  styleSheet.setAttribute('data-filtermodal-animations', 'true');
  document.head.appendChild(styleSheet);
}

export default FilterModal;

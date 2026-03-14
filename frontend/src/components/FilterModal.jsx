import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';

function FilterModal({ onClose, onApply, onReset, isClosing = false, initialFilters = {} }) {
  const [selectedDepartments, setSelectedDepartments] = useState(initialFilters.departments || []);
  const [selectedCredits, setSelectedCredits] = useState(initialFilters.creditHours || []);
  const [selectedProfessors, setSelectedProfessors] = useState(initialFilters.professors || []);
  const [selectedYears, setSelectedYears] = useState(initialFilters.years || []);
  const [onlyOpenClasses, setOnlyOpenClasses] = useState(initialFilters.isAvailable !== undefined ? initialFilters.isAvailable : false);
  
  const [timeslots, setTimeslots] = useState(() => {
    if (!initialFilters.timeslots || !Array.isArray(initialFilters.timeslots)) return [];
    
    const uiTimeslotsMap = new Map();
    let idCounter = 1;

    initialFilters.timeslots.forEach(ts => {
      const timeKey = `${ts.hour}:${ts.minute}:${ts.length}`;
      
      if (!uiTimeslotsMap.has(timeKey)) {
        const startTime = `${String(ts.hour).padStart(2, '0')}:${String(ts.minute).padStart(2, '0')}`;
        const totalMinutes = ts.hour * 60 + ts.minute + ts.length;
        const endHour = Math.floor(totalMinutes / 60) % 24;
        const endMinute = totalMinutes % 60;
        const endTime = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`;

        uiTimeslotsMap.set(timeKey, {
          id: idCounter++,
          days: [],
          startTime: startTime,
          endTime: endTime,
        });
      }
      uiTimeslotsMap.get(timeKey).days.push(ts.day);
    });

    return Array.from(uiTimeslotsMap.values());
  });

  const [nextId, setNextId] = useState(timeslots.length + 1);
  
  // Options loaded from API
  const [departments, setDepartments] = useState([]);
  const [credits, setCredits] = useState([]);
  const [professors, setProfessors] = useState([]);
  const [years, setYears] = useState([]);
  
  const [deptDropdownOpen, setDeptDropdownOpen] = useState(false);
  const [creditsDropdownOpen, setCreditsDropdownOpen] = useState(false);
  const [profDropdownOpen, setProfDropdownOpen] = useState(false);
  const [yearDropdownOpen, setYearDropdownOpen] = useState(false);
  const [openDaysDropdown, setOpenDaysDropdown] = useState(null); // Stores the id of the open dropdown
  const [hoveredClose, setHoveredClose] = useState(false);
  const [closeTooltipPos, setCloseTooltipPos] = useState({ x: 0, y: 0 });
  const closeButtonRef = useRef(null);
  const deptRef = useRef(null);
  const creditsRef = useRef(null);
  const profRef = useRef(null);
  const yearsRef = useRef(null);
  const daysRefs = useRef({});

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

        if (deptRes.ok) setDepartments(await deptRes.json());
        if (credRes.ok) setCredits(await credRes.json());
        if (profRes.ok) {
          const data = await profRes.json();
          setProfessors(data.filter(prof => prof && prof.trim() !== ''));
        }
        if (yearRes.ok) setYears(await yearRes.json());
      } catch (error) {
        console.error("Failed to fetch filter options:", error);
      }
    };
    fetchFilterOptions();
  }, []);

  const addTimeslot = () => {
    setTimeslots([...timeslots, { id: nextId, days: [], startTime: '', endTime: '' }]);
    setNextId(nextId + 1);
  };

  const removeTimeslot = (id) => {
    setTimeslots(timeslots.filter(slot => slot.id !== id));
  };

  const handleTimeslotChange = (id, field, value) => {
    setTimeslots(timeslots.map(slot => 
      slot.id === id ? { ...slot, [field]: value } : slot
    ));
  };
  
  const toggleMultiSelectItem = (selectedItems, setSelectedItems, item) => {
    setSelectedItems(
      selectedItems.includes(item)
        ? selectedItems.filter(i => i !== item)
        : [...selectedItems, item]
    );
  };

  const getSelectedItemsDisplay = (selectedItems, defaultText) => {
    if (selectedItems.length === 0) return defaultText;
    if (selectedItems.length === 1) return selectedItems[0];
    return `${selectedItems.length} selected`;
  };

  const toggleTimeslotDay = (id, day) => {
    setTimeslots(timeslots.map(slot => {
      if (slot.id === id) {
        const newDays = slot.days.includes(day)
          ? slot.days.filter(d => d !== day)
          : [...slot.days, day];
        return { ...slot, days: newDays };
      }
      return slot;
    }));
  };

  const handleCloseTooltip = () => {
    if (closeButtonRef?.current) {
      const rect = closeButtonRef.current.getBoundingClientRect();
      setCloseTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 12 });
    }
  };

  const getSelectedDaysDisplay = (selectedDays) => {
    if (selectedDays.length === 0) return 'Select days...';
    if (selectedDays.length === days.length) return 'All Weekdays';
    const dayMap = { 'Monday': 'M', 'Tuesday': 'T', 'Wednesday': 'W', 'Thursday': 'R', 'Friday': 'F' };
    return [...selectedDays].sort((a, b) => days.indexOf(a) - days.indexOf(b)).map(day => dayMap[day]).join('');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (deptDropdownOpen && deptRef.current && !deptRef.current.contains(event.target)) setDeptDropdownOpen(false);
      if (creditsDropdownOpen && creditsRef.current && !creditsRef.current.contains(event.target)) setCreditsDropdownOpen(false);
      if (profDropdownOpen && profRef.current && !profRef.current.contains(event.target)) setProfDropdownOpen(false);
      if (yearDropdownOpen && yearsRef.current && !yearsRef.current.contains(event.target)) setYearDropdownOpen(false);
      
      if (openDaysDropdown !== null) {
        const daysRef = daysRefs.current[openDaysDropdown];
        if (daysRef && !daysRef.contains(event.target)) {
          setOpenDaysDropdown(null);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [deptDropdownOpen, creditsDropdownOpen, profDropdownOpen, yearDropdownOpen, openDaysDropdown]);

  return (
    <div style={{ ...styles.filtersPanel, animation: isClosing ? 'filterSlideUp 0.25s forwards' : 'filterSlideDown 0.3s forwards' }}>
      <div style={styles.title}>Filter by...</div>
      
      <div style={styles.row}>
        <div style={styles.filterColumn}>
          <label style={styles.label}>Department</label>
          <div style={styles.multiSelectWrapper} ref={deptRef}>
            <button onClick={() => setDeptDropdownOpen(!deptDropdownOpen)} style={{ ...styles.multiSelectButton, borderColor: deptDropdownOpen ? '#1976D2' : '#E5E7EB' }}>
              <span>{getSelectedItemsDisplay(selectedDepartments, 'All Departments')}</span>
              <ChevronDown size={18} style={{ transform: deptDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>
            {deptDropdownOpen && (
              <div style={styles.daysDropdown}>
                {departments.map((dept) => (
                  <label key={dept} style={styles.daysCheckboxLabel}>
                    <input type="checkbox" checked={selectedDepartments.includes(dept)} onChange={() => toggleMultiSelectItem(selectedDepartments, setSelectedDepartments, dept)} style={{ cursor: 'pointer' }} />
                    {dept}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={styles.filterColumn}>
          <label style={styles.label}>Professor</label>
          <div style={styles.multiSelectWrapper} ref={profRef}>
            <button onClick={() => setProfDropdownOpen(!profDropdownOpen)} style={{ ...styles.multiSelectButton, borderColor: profDropdownOpen ? '#1976D2' : '#E5E7EB' }}>
              <span>{getSelectedItemsDisplay(selectedProfessors, 'All Professors')}</span>
              <ChevronDown size={18} style={{ transform: profDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>
            {profDropdownOpen && (
              <div style={styles.daysDropdown}>
                {professors.map((prof) => (
                  <label key={prof} style={styles.daysCheckboxLabel}>
                    <input type="checkbox" checked={selectedProfessors.includes(prof)} onChange={() => toggleMultiSelectItem(selectedProfessors, setSelectedProfessors, prof)} style={{ cursor: 'pointer' }} />
                    {prof}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={styles.row}>
        <div style={styles.filterColumn}>
          <label style={styles.label}>Credits</label>
          <div style={styles.multiSelectWrapper} ref={creditsRef}>
            <button onClick={() => setCreditsDropdownOpen(!creditsDropdownOpen)} style={{ ...styles.multiSelectButton, borderColor: creditsDropdownOpen ? '#1976D2' : '#E5E7EB' }}>
              <span>{getSelectedItemsDisplay(selectedCredits, 'Any Credits')}</span>
              <ChevronDown size={18} style={{ transform: creditsDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>
            {creditsDropdownOpen && (
              <div style={styles.daysDropdown}>
                {credits.map((credit) => (
                  <label key={credit} style={styles.daysCheckboxLabel}>
                    <input type="checkbox" checked={selectedCredits.includes(credit)} onChange={() => toggleMultiSelectItem(selectedCredits, setSelectedCredits, credit)} style={{ cursor: 'pointer' }} />
                    {credit}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
        <div style={styles.filterColumn}>
          <label style={styles.label}>Years</label>
          <div style={styles.multiSelectWrapper} ref={yearsRef}>
            <button onClick={() => setYearDropdownOpen(!yearDropdownOpen)} style={{ ...styles.multiSelectButton, borderColor: yearDropdownOpen ? '#1976D2' : '#E5E7EB' }}>
              <span>{getSelectedItemsDisplay(selectedYears, 'All Years')}</span>
              <ChevronDown size={18} style={{ transform: yearDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
            </button>
            {yearDropdownOpen && (
              <div style={styles.daysDropdown}>
                {years.map((year) => (
                  <label key={year} style={styles.daysCheckboxLabel}>
                    <input type="checkbox" checked={selectedYears.includes(year)} onChange={() => toggleMultiSelectItem(selectedYears, setSelectedYears, year)} style={{ cursor: 'pointer' }} />
                    {year}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={styles.filterRow}>
        <label style={styles.label}>Timeslots</label>
        {timeslots.map((slot) => (
          <div key={slot.id} style={{ ...styles.row, alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ ...styles.filterColumn, flex: 2 }} ref={(el) => (daysRefs.current[slot.id] = el)}>
              <div style={styles.multiSelectWrapper}>
                <button onClick={() => setOpenDaysDropdown(openDaysDropdown === slot.id ? null : slot.id)} style={{ ...styles.multiSelectButton, borderColor: openDaysDropdown === slot.id ? '#1976D2' : '#E5E7EB' }}>
                  <span>{getSelectedDaysDisplay(slot.days)}</span>
                  <ChevronDown size={18} style={{ transform: openDaysDropdown === slot.id ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                </button>
                {openDaysDropdown === slot.id && (
                  <div style={styles.daysDropdown}>
                    {days.map((day) => (
                      <label key={day} style={styles.daysCheckboxLabel}>
                        <input type="checkbox" checked={slot.days.includes(day)} onChange={() => toggleTimeslotDay(slot.id, day)} style={{ cursor: 'pointer' }} />
                        {day}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={styles.timeRange}>
              <input type="time" style={styles.timeInput} value={slot.startTime} onChange={(e) => handleTimeslotChange(slot.id, 'startTime', e.target.value)} />
              <span style={styles.timeSeparator}>to</span>
              <input type="time" style={styles.timeInput} value={slot.endTime} onChange={(e) => handleTimeslotChange(slot.id, 'endTime', e.target.value)} />
            </div>
            <button onClick={() => removeTimeslot(slot.id)} style={styles.removeButton}><Trash2 size={16} /></button>
          </div>
        ))}
        <button onClick={addTimeslot} style={styles.addButton}>
          <Plus size={16} style={{ marginRight: '0.25rem' }} />
          Add Timeslot
        </button>
      </div>

      <div style={styles.filterRow}>
        <label style={styles.daysCheckboxLabel}>
          <input type="checkbox" checked={onlyOpenClasses} onChange={() => setOnlyOpenClasses(!onlyOpenClasses)} style={{ cursor: 'pointer' }} />
          Only show open classes
        </label>
      </div>

      <div style={styles.buttonGroup}>
        <button style={styles.applyButton} onClick={() => {
          const timeslotsPayload = [];
          timeslots.forEach(slot => {
            if (slot.days.length > 0 && slot.startTime) {
              const [startHour, startMinute] = slot.startTime.split(':').map(Number);
              let length = 0;
              if (slot.endTime) {
                const [endHour, endMinute] = slot.endTime.split(':').map(Number);
                const diff = (new Date(0,0,0,endHour,endMinute) - new Date(0,0,0,startHour,startMinute)) / 60000;
                length = diff > 0 ? diff : 0;
              }
              slot.days
                .filter(day => day && day.trim() !== '')
                .forEach(day => {
                  timeslotsPayload.push({
                    day,
                    hour: startHour,
                    minute: startMinute,
                    length
                  });
                });
            }
          });
          onApply({
            departments: selectedDepartments,
            codes: [], semesters: [], years: selectedYears,
            professors: selectedProfessors,
            timeslots: timeslotsPayload,
            creditHours: selectedCredits.map(c => parseInt(c, 10)),
            isAvailable: onlyOpenClasses, 
            prerequisites: [],
          });
        }}>
          Apply Filters
        </button>
        <button style={styles.resetButton} onClick={() => {
            setSelectedDepartments([]);
            setSelectedCredits([]);
            setSelectedProfessors([]);
            setSelectedYears([]);
            setOnlyOpenClasses(true);
            setTimeslots([]);
            onReset();
        }}>Reset</button>
      </div>

      <button ref={closeButtonRef} onClick={onClose} onMouseEnter={(e) => { handleCloseTooltip(); setHoveredClose(true); e.target.style.color = '#1F2937'; }} onMouseLeave={(e) => { setHoveredClose(false); e.target.style.color = '#6B7280'; }} style={styles.closeButton} aria-label="Close filters">
        <ChevronDown size={24} />
      </button>

      {hoveredClose && (
        <div style={{ ...styles.closeTooltip, left: `${closeTooltipPos.x}px`, top: `${closeTooltipPos.y}px` }}>
          Close
        </div>
      )}
    </div>
  );
}

const styles = {
  filtersPanel: {
    width: '100%', boxSizing: 'border-box', marginTop: '0.75rem', padding: '1.25rem', border: '1px solid #E5E7EB',
    borderRadius: '12px', background: '#FFFFFF', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', display: 'flex',
    flexDirection: 'column', gap: '1rem', zIndex: 10, position: 'relative', paddingTop: '3rem',
  },
  title: {
    position: 'absolute', top: '1rem', left: '1.25rem', fontSize: '1.05rem', fontWeight: '600', color: '#1F2937',
  },
  row: { display: 'flex', gap: '1rem', width: '100%' },
  filterColumn: { flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: 0 },
  filterRow: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.95rem', fontWeight: '500', color: '#1F2937' },
  dropdownOption: {
    width: '100%', padding: '0.6rem 0.5rem', border: 'none', borderRadius: '4px', fontSize: '0.95rem',
    fontFamily: 'inherit', cursor: 'pointer', transition: 'background 0.2s, color 0.2s', textAlign: 'left', background: 'transparent',
  },
  multiSelectWrapper: { position: 'relative' },
  multiSelectButton: {
    width: '100%', padding: '0.6rem', borderRadius: '6px', border: '2px solid #E5E7EB', fontSize: '0.95rem',
    fontFamily: 'inherit', cursor: 'pointer', transition: 'border 0.2s', display: 'flex',
    justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF', color: '#1F2937',
  },
  daysDropdown: {
    position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.25rem', background: '#FFFFFF',
    border: '2px solid #1976D2', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    zIndex: 20, display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.5rem',
    maxHeight: '200px', overflowY: 'auto',
  },
  daysCheckboxLabel: {
    display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem',
    color: '#1F2937', cursor: 'pointer', padding: '0.4rem 0.5rem', borderRadius: '4px', transition: 'background 0.2s',
  },
  timeRange: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  timeInput: {
    flex: 1, padding: '0.6rem', borderRadius: '6px', border: '2px solid #E5E7EB',
    fontSize: '0.95rem', fontFamily: 'inherit', cursor: 'pointer',
  },
  timeSeparator: { color: '#6B7280', fontSize: '0.9rem' },
  buttonGroup: { display: 'flex', gap: '0.75rem', marginTop: '0.5rem' },
  applyButton: {
    flex: 1, padding: '0.75rem 1rem', background: '#1976D2', color: 'white', border: 'none',
    borderRadius: '8px', fontSize: '0.95rem', fontWeight: '500', cursor: 'pointer', transition: 'background 0.2s, box-shadow 0.2s',
  },
  resetButton: {
    flex: 1, padding: '0.75rem 1rem', background: '#F3F4F6', color: '#1F2937',
    border: '1px solid #D1D5DB', borderRadius: '8px', fontSize: '0.95rem', fontWeight: '500', cursor: 'pointer', transition: 'background 0.2s',
  },
  addButton: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.6rem', background: '#E0E7FF',
    color: '#1976D2', border: 'none', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s',
    fontSize: '0.9rem', fontWeight: '500'
  },
  removeButton: {
    padding: '0.5rem', background: 'transparent', border: 'none', color: '#9CA3AF',
    cursor: 'pointer', transition: 'color 0.2s',
  },
  closeButton: {
    position: 'absolute', top: '0.85rem', right: '1.15rem', background: 'transparent', border: 'none',
    color: '#6B7280', cursor: 'pointer', transition: 'color 0.2s', padding: '0.5rem', width: '40px',
    height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px',
  },
  closeTooltip: {
    position: 'fixed', transform: 'translate(-275%, -200%)', background: 'rgba(31, 41, 55, 0.95)',
    color: 'white', padding: '0.5rem 0.75rem', borderRadius: '4px', fontSize: '0.85rem', fontWeight: '500',
    whiteSpace: 'nowrap', pointerEvents: 'none', zIndex: 1001, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
};

const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes filterSlideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes filterSlideUp { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-20px); } }
`;
if (!document.head.querySelector('style[data-filtermodal-animations="true"]')) {
  styleSheet.setAttribute('data-filtermodal-animations', 'true');
  document.head.appendChild(styleSheet);
}

export default FilterModal;

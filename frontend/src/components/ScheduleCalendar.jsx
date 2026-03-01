import React from 'react';

function ScheduleCalendar() {
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
    marginBottom: '1rem',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(5, 1fr)',
    gap: '8px',
  };

  const dayStyle = {
    border: '2px solid #1976D2',
    height: '50px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: '#1976D2',
    fontSize: '0.9rem',
  };

  return (
    <div style={panelStyle}>
      <h2 style={headingStyle}>Weekly Schedule (placeholder)</h2>
      <div style={gridStyle}>
        <div style={dayStyle}>Mon</div>
        <div style={dayStyle}>Tue</div>
        <div style={dayStyle}>Wed</div>
        <div style={dayStyle}>Thu</div>
        <div style={dayStyle}>Fri</div>
      </div>
    </div>
  );
}

export default ScheduleCalendar;
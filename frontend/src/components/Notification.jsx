import React, { useState, createContext, useContext, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle } from 'lucide-react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 5000); // Auto-dismiss after 5 seconds
  }, []);

  const hideNotification = () => {
    setNotification(null);
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={hideNotification}
        />
      )}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  return useContext(NotificationContext);
};

function Notification({ message, type, onClose }) {
  const isSuccess = type === 'success';

  const containerStyle = {
    position: 'fixed',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '1rem 1.5rem',
    borderRadius: '8px',
    color: 'white',
    backgroundColor: isSuccess ? '#2E7D32' : '#D32F2F',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    zIndex: 2000,
    animation: 'slideInFromTop 0.5s cubic-bezier(0.2, 0, 0.2, 1)',
    minWidth: '300px',
    maxWidth: '90vw',
  };

  const iconStyle = {
    flexShrink: 0,
  };

  const closeButtonStyle = {
    background: 'transparent',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '0.25rem',
    marginLeft: '1rem',
  };

  return (
    <>
      <style>{`
        @keyframes slideInFromTop {
          from { 
            transform: translate(-50%, -100%);
            opacity: 0;
          }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
      `}</style>
      <div style={containerStyle}>
        {isSuccess ? <CheckCircle size={24} style={iconStyle} /> : <AlertTriangle size={24} style={iconStyle} />}
        <span>{message}</span>
        <button onClick={onClose} style={closeButtonStyle} aria-label="Close notification"><X size={20} /></button>
      </div>
    </>
  );
}
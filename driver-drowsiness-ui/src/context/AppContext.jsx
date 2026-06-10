import React, { createContext, useState, useContext, useEffect } from 'react';

const AppContext = createContext();

// Mock Initial Data
const initialDrivers = [
  { id: 1, username: 'john_doe', email: 'john@sddds.org', status: 'active', currentEAR: 0.31, lastActive: 'Just now', safetyScore: 94 },
  { id: 2, username: 'alex_smith', email: 'alex@sddds.org', status: 'drowsy', currentEAR: 0.18, lastActive: '2 mins ago', safetyScore: 78 },
  { id: 3, username: 'sarah_jones', email: 'sarah@sddds.org', status: 'offline', currentEAR: 0.0, lastActive: '1 hour ago', safetyScore: 98 },
  { id: 4, username: 'mike_brown', email: 'mike@sddds.org', status: 'active', currentEAR: 0.29, lastActive: '5 mins ago', safetyScore: 89 },
];

const initialAlertLogs = [
  { id: 101, session_id: 201, user_id: 2, username: 'alex_smith', drowsiness_level: 0.85, timestamp: new Date(Date.now() - 120000).toISOString(), status: 'alerted' },
  { id: 102, session_id: 201, user_id: 2, username: 'alex_smith', drowsiness_level: 0.72, timestamp: new Date(Date.now() - 300000).toISOString(), status: 'dismissed' },
  { id: 103, session_id: 202, user_id: 1, username: 'john_doe', drowsiness_level: 0.92, timestamp: new Date(Date.now() - 600000).toISOString(), status: 'ignored' },
  { id: 104, session_id: 203, user_id: 4, username: 'mike_brown', drowsiness_level: 0.78, timestamp: new Date(Date.now() - 900000).toISOString(), status: 'dismissed' },
];

export const AppProvider = ({ children }) => {
  // Authentication State
  const [user, setUser] = useState(() => {
    const cached = localStorage.getItem('sddds_user');
    return cached ? JSON.parse(cached) : null;
  });

  // Drivers List (For admin dashboard monitoring)
  const [drivers, setDrivers] = useState(initialDrivers);

  // Active Monitoring Session for current driver
  const [activeSession, setActiveSession] = useState(null);

  // List of Alerts
  const [alerts, setAlerts] = useState(initialAlertLogs);

  // Synchronize User Cache
  const login = (username, role) => {
    const newUser = { username, role, email: `${username}@sddds.org` };
    setUser(newUser);
    localStorage.setItem('sddds_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    setActiveSession(null);
    localStorage.removeItem('sddds_user');
  };

  // Start a monitoring session
  const startSession = () => {
    const sessionId = Math.floor(Math.random() * 1000) + 300;
    const newSession = {
      id: sessionId,
      startTime: new Date().toISOString(),
      alertsCount: 0,
      status: 'active'
    };
    setActiveSession(newSession);

    // Update driver state to active
    if (user && user.role === 'driver') {
      setDrivers(prev => prev.map(d => 
        d.username === user.username ? { ...d, status: 'active', lastActive: 'Just now' } : d
      ));
    }
  };

  // Stop current monitoring session
  const stopSession = () => {
    if (activeSession) {
      setActiveSession(null);
      if (user && user.role === 'driver') {
        setDrivers(prev => prev.map(d => 
          d.username === user.username ? { ...d, status: 'offline', lastActive: 'Just now' } : d
        ));
      }
    }
  };

  // Trigger Drowsiness Alert
  const triggerAlert = (drowsinessLevel) => {
    if (!user) return;
    
    const newAlert = {
      id: Math.floor(Math.random() * 10000) + 1000,
      session_id: activeSession ? activeSession.id : 999,
      user_id: user.username === 'john_doe' ? 1 : 99,
      username: user.username,
      drowsiness_level: parseFloat(drowsinessLevel.toFixed(2)),
      timestamp: new Date().toISOString(),
      status: 'alerted'
    };

    setAlerts(prev => [newAlert, ...prev]);

    // Update session alerts count
    if (activeSession) {
      setActiveSession(prev => ({
        ...prev,
        alertsCount: prev.alertsCount + 1
      }));
    }

    // Update driver status in global list
    setDrivers(prev => prev.map(d => 
      d.username === user.username ? { ...d, status: 'drowsy', currentEAR: 0.15 } : d
    ));
  };

  // Admin action to change alert status (e.g. dismiss or flag)
  const updateAlertStatus = (alertId, newStatus) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, status: newStatus } : a
    ));
  };

  // Simulate real-time EAR updates for active drivers
  useEffect(() => {
    const interval = setInterval(() => {
      setDrivers(prev => prev.map(d => {
        if (d.status === 'offline') return d;
        // Keep active driver EAR oscillating realistically (0.22 - 0.35)
        // If driver is currently drowsy, keep it low (0.12 - 0.18)
        let variation = (Math.random() * 0.06) - 0.03;
        let baseEAR = d.status === 'drowsy' ? 0.15 : 0.28;
        let newEAR = Math.max(0.1, Math.min(0.45, baseEAR + variation));
        
        return {
          ...d,
          currentEAR: parseFloat(newEAR.toFixed(2))
        };
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <AppContext.Provider value={{
      user,
      drivers,
      activeSession,
      alerts,
      login,
      logout,
      startSession,
      stopSession,
      triggerAlert,
      updateAlertStatus,
      setDrivers
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);

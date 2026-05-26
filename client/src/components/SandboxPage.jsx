import { useState, useEffect } from 'react';
import authService, { ROLES } from '../services/AuthService';
import storageService from '../services/StorageService';
import notificationService from '../services/NotificationService';
import loggerService from '../services/LoggerService';
import configurationService from '../services/ConfigurationService';

// Renders the Services Sandbox test panel page
function SandboxPage() {
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [lastLogin, setLastLogin] = useState(storageService.get('last_login_time', 'Never'));

  const [storageKey, setStorageKey] = useState('');
  const [storageVal, setStorageVal] = useState('');
  const [storageResult, setStorageResult] = useState('');
  
  const [notifMessage, setNotifMessage] = useState('');
  const [notifHistory, setNotifHistory] = useState([]);
  
  const [loggerLogs, setLoggerLogs] = useState([]);
  
  const [configData, setConfigData] = useState({});
  const [configKey, setConfigKey] = useState('');
  const [configVal, setConfigVal] = useState('');

  // Initial load of logs history and configuration fields on mount
  useEffect(() => {
    setNotifHistory(notificationService.getHistory());
    setLoggerLogs(loggerService.getLogs().slice(-10).reverse());
    setConfigData(configurationService.getAll());

    // Subscriber listener to update logs lists when alerts trigger
    const unsubscribe = notificationService.subscribe(() => {
      setNotifHistory(notificationService.getHistory());
      setLoggerLogs(loggerService.getLogs().slice(-10).reverse());
      setCurrentUser(authService.getCurrentUser());
    });

    return () => unsubscribe();
  }, []);

  // Quick action helper to login as teacher
  const handleLoginAsLecturer = async () => {
    try {
      const user = await authService.login('teacher1', 'pass123');
      const timeString = new Date().toLocaleString();
      storageService.set('last_login_time', timeString);
      setLastLogin(timeString);
      setCurrentUser(user);
      notificationService.success(`Welcome back, ${user.fullName}!`);
      window.location.reload();
    } catch (err) {
      notificationService.error(err.message);
    }
  };

  // Quick action helper to login as student
  const handleLoginAsStudent = async () => {
    try {
      const user = await authService.login('student1', 'pass123');
      const timeString = new Date().toLocaleString();
      storageService.set('last_login_time', timeString);
      setLastLogin(timeString);
      setCurrentUser(user);
      notificationService.success(`Welcome back, ${user.fullName}!`);
      window.location.reload();
    } catch (err) {
      notificationService.error(err.message);
    }
  };

  // Logout helper to wipe sessions and reload routes
  const handleQuickLogout = () => {
    authService.logout();
    setCurrentUser(null);
    notificationService.success('Logged out successfully.');
    window.location.reload();
  };

  // Saves test values into prefixnamespaced StorageService keys
  const handleStorageSet = () => {
    if (!storageKey) return;
    storageService.set(storageKey, storageVal);
    setStorageResult(`Set ${storageKey} to "${storageVal}"`);
  };

  // Loads test values from prefixnamespaced keys with default fallbacks
  const handleStorageGet = () => {
    if (!storageKey) return;
    const val = storageService.get(storageKey, 'KEY_NOT_FOUND_DEFAULT');
    setStorageResult(`Value: ${JSON.stringify(val)}`);
  };

  // Slices specific storage keys
  const handleStorageRemove = () => {
    if (!storageKey) return;
    storageService.remove(storageKey);
    setStorageResult(`Removed key: ${storageKey}`);
  };

  // Clears namespaced keys entirely
  const handleStorageClear = () => {
    storageService.clear();
    setStorageResult('Cleared storage');
  };

  // Trigger test success alerts
  const triggerSuccess = () => {
    notificationService.success(notifMessage || 'This is a test success message!');
    setNotifMessage('');
  };

  // Trigger test error alerts
  const triggerError = () => {
    notificationService.error(notifMessage || 'This is a test error message!');
    setNotifMessage('');
  };

  // Trigger test warning alerts
  const triggerWarning = () => {
    notificationService.warning(notifMessage || 'This is a test warning message!');
    setNotifMessage('');
  };

  // Log a background info trace to the logs stream without toast overlays
  const triggerInfoLog = () => {
    loggerService.info(notifMessage || 'Default Info Log');
    setLoggerLogs(loggerService.getLogs().slice(-10).reverse());
    setNotifMessage('');
  };

  // Update configuration parameters dynamically
  const handleConfigSet = () => {
    if (!configKey) return;
    configurationService.set(configKey, configVal);
    setConfigData(configurationService.getAll());
    setConfigKey('');
    setConfigVal('');
  };

  return (
    <div className="card shadow-sm p-4 mt-3" style={{ borderRadius: '16px', border: 'none' }}>
      <h2 className="fw-bold mb-4">🛠️ Services Sandbox Test</h2>
      
      {/* Quick authentication test panel */}
      <div className="p-3 bg-light rounded-4 mb-4 border text-center">
        <h4 className="fw-bold mb-2">🔐 Quick Authentication Check</h4>
        <p className="mb-1 text-muted">
          Current Status: <strong>
            {currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'Not logged in'}
          </strong>
        </p>
        <p className="small text-muted mb-3">Last Login: {lastLogin}</p>
        <div className="d-flex justify-content-center gap-2">
          <button className="btn btn-dark btn-sm fw-semibold" onClick={handleLoginAsLecturer}>Login as Lecturer</button>
          <button className="btn btn-dark btn-sm fw-semibold" onClick={handleLoginAsStudent}>Login as Student</button>
          <button className="btn btn-outline-dark btn-sm fw-semibold" onClick={handleQuickLogout}>Logout</button>
        </div>
      </div>

      <div className="row g-4">
        {/* StorageService operations workbench */}
        <div className="col-md-6">
          <div className="p-3 bg-light rounded-4 h-100 border">
            <h4 className="fw-bold mb-3">💾 StorageService Test</h4>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Key"
                className="form-control mb-2"
                value={storageKey}
                onChange={(e) => setStorageKey(e.target.value)}
                style={{ borderRadius: '8px' }}
              />
              <input
                type="text"
                placeholder="Value"
                className="form-control mb-2"
                value={storageVal}
                onChange={(e) => setStorageVal(e.target.value)}
                style={{ borderRadius: '8px' }}
              />
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button className="btn btn-primary btn-sm" onClick={handleStorageSet}>Set</button>
              <button className="btn btn-secondary btn-sm" onClick={handleStorageGet}>Get (with Default)</button>
              <button className="btn btn-warning btn-sm text-dark" onClick={handleStorageRemove}>Remove</button>
              <button className="btn btn-danger btn-sm" onClick={handleStorageClear}>Clear Prefixed</button>
            </div>
            {storageResult && (
              <div className="alert alert-info mt-3 py-2 mb-0" style={{ borderRadius: '8px' }}>
                {storageResult}
              </div>
            )}
          </div>
        </div>

        {/* NotificationService alerts trigger test bench */}
        <div className="col-md-6">
          <div className="p-3 bg-light rounded-4 h-100 border">
            <h4 className="fw-bold mb-3">🔔 NotificationService Test</h4>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Enter custom notification message (optional)"
                className="form-control"
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                style={{ borderRadius: '8px' }}
              />
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button className="btn btn-success btn-sm" onClick={triggerSuccess}>Trigger Success</button>
              <button className="btn btn-danger btn-sm" onClick={triggerError}>Trigger Error</button>
              <button className="btn btn-warning btn-sm text-dark" onClick={triggerWarning}>Trigger Warning</button>
              <button className="btn btn-info btn-sm" onClick={triggerInfoLog}>Log Info Only</button>
            </div>
          </div>
        </div>

        {/* Active notifications broadcast history display */}
        <div className="col-md-6">
          <div className="p-3 bg-light rounded-4 h-100 border">
            <h4 className="fw-bold mb-3">📋 Local Activity Log (Notifications)</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {notifHistory.length === 0 ? (
                <p className="text-muted small">No notifications triggered yet.</p>
              ) : (
                <ul className="list-group list-group-flush rounded-3">
                  {notifHistory.slice().reverse().map((item) => (
                    <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center py-2 px-1">
                      <div>
                        <span className={`badge me-2 ${item.type === 'SUCCESS' ? 'bg-success' : item.type === 'ERROR' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                          {item.type}
                        </span>
                        <span className="small">{item.message}</span>
                      </div>
                      <span className="text-muted" style={{ fontSize: '10px' }}>
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* LoggerService logs terminal listing */}
        <div className="col-md-6">
          <div className="p-3 bg-light rounded-4 h-100 border">
            <h4 className="fw-bold mb-3">🪵 LoggerService Logs (Last 10 Logs)</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {loggerLogs.length === 0 ? (
                <p className="text-muted small">No logs created yet.</p>
              ) : (
                <ul className="list-group list-group-flush rounded-3">
                  {loggerLogs.map((item, index) => (
                    <li key={index} className="list-group-item py-1 px-1" style={{ fontSize: '12px' }}>
                      <span className="text-muted me-2" style={{ fontFamily: 'monospace' }}>
                        [{new Date(item.timestamp).toLocaleTimeString()}]
                      </span>
                      <span className={`badge me-2 ${item.type === 'SUCCESS' ? 'bg-success' : item.type === 'ERROR' ? 'bg-danger' : item.type === 'WARNING' ? 'bg-warning text-dark' : 'bg-info'}`}>
                        {item.type}
                      </span>
                      <span>{item.message}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* ConfigurationService static parameters grid */}
        <div className="col-12">
          <div className="p-3 bg-light rounded-4 border">
            <h4 className="fw-bold mb-3">⚙️ ConfigurationService Values</h4>
            <div className="row">
              <div className="col-md-6">
                <ul className="list-group">
                  {Object.entries(configData).map(([key, value]) => (
                    <li key={key} className="list-group-item d-flex justify-content-between py-2">
                      <strong className="text-muted">{key}:</strong>
                      <span>{String(value)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-md-6">
                <div className="p-2 border rounded-3 bg-white">
                  <h6 className="fw-bold mb-2">Set/Override Configuration</h6>
                  <input
                    type="text"
                    placeholder="Config Key"
                    className="form-control form-control-sm mb-2"
                    value={configKey}
                    onChange={(e) => setConfigKey(e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Config Value"
                    className="form-control form-control-sm mb-2"
                    value={configVal}
                    onChange={(e) => setConfigVal(e.target.value)}
                  />
                  <button className="btn btn-primary btn-sm w-100" onClick={handleConfigSet}>Update Config</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SandboxPage;

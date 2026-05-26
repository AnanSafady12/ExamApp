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

  useEffect(() => {
    setNotifHistory(notificationService.getHistory());
    setLoggerLogs(loggerService.getLogs().slice(-10).reverse());
    setConfigData(configurationService.getAll());

    const unsubscribe = notificationService.subscribe(() => {
      setNotifHistory(notificationService.getHistory());
      setLoggerLogs(loggerService.getLogs().slice(-10).reverse());
      setCurrentUser(authService.getCurrentUser());
    });

    return () => unsubscribe();
  }, []);

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

  const handleQuickLogout = () => {
    authService.logout();
    setCurrentUser(null);
    notificationService.success('Logged out successfully.');
    window.location.reload();
  };

  const handleStorageSet = () => {
    if (!storageKey) return;
    storageService.set(storageKey, storageVal);
    setStorageResult(`Set ${storageKey} to "${storageVal}"`);
  };

  const handleStorageGet = () => {
    if (!storageKey) return;
    const val = storageService.get(storageKey, 'KEY_NOT_FOUND_DEFAULT');
    setStorageResult(`Value: ${JSON.stringify(val)}`);
  };

  const handleStorageRemove = () => {
    if (!storageKey) return;
    storageService.remove(storageKey);
    setStorageResult(`Removed key: ${storageKey}`);
  };

  const handleStorageClear = () => {
    storageService.clear();
    setStorageResult('Cleared storage');
  };

  const triggerSuccess = () => {
    notificationService.success(notifMessage || 'This is a test success message!');
    setNotifMessage('');
  };

  const triggerError = () => {
    notificationService.error(notifMessage || 'This is a test error message!');
    setNotifMessage('');
  };

  const triggerWarning = () => {
    notificationService.warning(notifMessage || 'This is a test warning message!');
    setNotifMessage('');
  };

  const triggerInfoLog = () => {
    loggerService.info(notifMessage || 'Default Info Log');
    setLoggerLogs(loggerService.getLogs().slice(-10).reverse());
    setNotifMessage('');
  };

  const handleConfigSet = () => {
    if (!configKey) return;
    configurationService.set(configKey, configVal);
    setConfigData(configurationService.getAll());
    setConfigKey('');
    setConfigVal('');
  };

  return (
    <div className="card-premium mt-3" style={{ padding: '28px' }}>
      <h2 className="fw-bold mb-4" style={{ color: 'var(--text-h)' }}>🛠️ Services Sandbox test-bench</h2>

      <div className="p-4 mb-4 text-center rounded-4 border-0" style={{ background: 'var(--primary-light)', padding: '20px' }}>
        <h4 className="fw-bold mb-2" style={{ color: 'var(--primary)' }}>🔐 Quick Authentication Check</h4>
        <p className="mb-1 text-muted">
          Current Session: <strong>
            {currentUser ? `${currentUser.fullName} (${currentUser.role})` : 'Not logged in'}
          </strong>
        </p>
        <p className="small text-muted mb-3" style={{ fontSize: '13px' }}>Last Login: {lastLogin}</p>
        <div className="d-flex justify-content-center gap-2 flex-wrap">
          <button className="btn btn-outline-primary btn-sm fw-bold px-3 py-2" onClick={handleLoginAsLecturer} style={{ borderRadius: '8px', color: 'var(--primary)', borderColor: 'var(--primary-border)', background: 'var(--bg-card)' }}>Login as Lecturer</button>
          <button className="btn btn-outline-primary btn-sm fw-bold px-3 py-2" onClick={handleLoginAsStudent} style={{ borderRadius: '8px', color: 'var(--primary)', borderColor: 'var(--primary-border)', background: 'var(--bg-card)' }}>Login as Student</button>
          <button className="btn btn-outline-danger btn-sm fw-bold px-3 py-2" onClick={handleQuickLogout} style={{ borderRadius: '8px', color: 'var(--danger)', borderColor: 'var(--danger-border)', background: 'var(--bg-card)' }}>Quick Logout</button>
        </div>
      </div>

      <div className="row g-4">
        {/* StorageService operations workbench */}
        <div className="col-md-6">
          <div className="p-4 rounded-4 h-100 border-0" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h4 className="fw-bold mb-3" style={{ color: 'var(--text-h)', fontSize: '1.25rem' }}>💾 StorageService Test</h4>
            <div className="mb-3 d-flex flex-column gap-2">
              <input
                type="text"
                placeholder="Storage Key"
                className="form-control"
                value={storageKey}
                onChange={(e) => setStorageKey(e.target.value)}
                style={{ borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--bg-card)' }}
              />
              <input
                type="text"
                placeholder="Storage Value"
                className="form-control"
                value={storageVal}
                onChange={(e) => setStorageVal(e.target.value)}
                style={{ borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--bg-card)' }}
              />
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button className="btn btn-primary btn-sm px-3 py-1.5 fw-bold" onClick={handleStorageSet} style={{ borderRadius: '8px', background: 'var(--primary)', border: 'none' }}>Set</button>
              <button className="btn btn-secondary btn-sm px-3 py-1.5 fw-bold" onClick={handleStorageGet} style={{ borderRadius: '8px', background: 'var(--secondary)', border: 'none' }}>Get (with Default)</button>
              <button className="btn btn-warning btn-sm px-3 py-1.5 fw-bold text-white" onClick={handleStorageRemove} style={{ borderRadius: '8px', background: 'var(--warning)', border: 'none' }}>Remove</button>
              <button className="btn btn-danger btn-sm px-3 py-1.5 fw-bold" onClick={handleStorageClear} style={{ borderRadius: '8px', background: 'var(--danger)', border: 'none' }}>Clear Prefixed</button>
            </div>
            {storageResult && (
              <div className="alert alert-info mt-3 py-2 mb-0 border-0 text-center" style={{ borderRadius: '8px', background: 'var(--primary-light)', color: 'var(--primary)' }}>
                {storageResult}
              </div>
            )}
          </div>
        </div>

        {/* NotificationService alerts trigger test bench */}
        <div className="col-md-6">
          <div className="p-4 rounded-4 h-100 border-0" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h4 className="fw-bold mb-3" style={{ color: 'var(--text-h)', fontSize: '1.25rem' }}>🔔 NotificationService Test</h4>
            <div className="mb-3">
              <input
                type="text"
                placeholder="Enter custom alert message..."
                className="form-control"
                value={notifMessage}
                onChange={(e) => setNotifMessage(e.target.value)}
                style={{ borderRadius: '10px', border: '1.5px solid var(--border)', background: 'var(--bg-card)' }}
              />
            </div>
            <div className="d-flex flex-wrap gap-2">
              <button className="btn btn-success btn-sm px-3 py-1.5 fw-bold" onClick={triggerSuccess} style={{ borderRadius: '8px', background: 'var(--success)', border: 'none' }}>Trigger Success</button>
              <button className="btn btn-danger btn-sm px-3 py-1.5 fw-bold" onClick={triggerError} style={{ borderRadius: '8px', background: 'var(--danger)', border: 'none' }}>Trigger Error</button>
              <button className="btn btn-warning btn-sm px-3 py-1.5 fw-bold text-white" onClick={triggerWarning} style={{ borderRadius: '8px', background: 'var(--warning)', border: 'none' }}>Trigger Warning</button>
              <button className="btn btn-info btn-sm px-3 py-1.5 fw-bold text-white" onClick={triggerInfoLog} style={{ borderRadius: '8px', background: 'var(--secondary)', border: 'none' }}>Log Info Only</button>
            </div>
          </div>
        </div>

        {/* Active notifications broadcast history display */}
        <div className="col-md-6">
          <div className="p-4 rounded-4 h-100 border-0" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h4 className="fw-bold mb-3" style={{ color: 'var(--text-h)', fontSize: '1.25rem' }}>📋 Local Activity Log (Notifications)</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
              {notifHistory.length === 0 ? (
                <p className="text-muted small py-2 mb-0">No notifications triggered yet.</p>
              ) : (
                <ul className="list-group list-group-flush rounded-3 gap-1">
                  {notifHistory.slice().reverse().map((item) => (
                    <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center py-2 px-2 border-0 rounded-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', marginBottom: '4px' }}>
                      <div>
                        <span className={`badge-role me-2 ${item.type === 'SUCCESS' ? 'badge-published' : 'badge-closed'}`} style={{ fontSize: '9px', padding: '2px 8px' }}>
                          {item.type}
                        </span>
                        <span className="small fw-semibold" style={{ color: 'var(--text-h)' }}>{item.message}</span>
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
          <div className="p-4 rounded-4 h-100 border-0" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h4 className="fw-bold mb-3" style={{ color: 'var(--text-h)', fontSize: '1.25rem' }}>🪵 LoggerService Logs (Last 10 Logs)</h4>
            <div style={{ maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
              {loggerLogs.length === 0 ? (
                <p className="text-muted small py-2 mb-0">No logs created yet.</p>
              ) : (
                <ul className="list-group list-group-flush rounded-3 gap-1">
                  {loggerLogs.map((item, index) => (
                    <li key={index} className="list-group-item py-2 px-2 border-0 rounded-3 d-flex justify-content-between align-items-center" style={{ background: 'var(--code-bg)', border: '1px solid var(--border)', marginBottom: '4px', fontSize: '12px' }}>
                      <div>
                        <span className="text-muted me-2 small" style={{ fontFamily: 'var(--mono)' }}>
                          [{new Date(item.timestamp).toLocaleTimeString()}]
                        </span>
                        <span className={`badge-role me-2 ${item.type === 'SUCCESS' ? 'badge-published' : item.type === 'ERROR' ? 'badge-closed' : item.type === 'WARNING' ? 'badge-draft' : 'badge-teacher'}`} style={{ fontSize: '9px', padding: '2px 8px' }}>
                          {item.type}
                        </span>
                        <span className="fw-semibold" style={{ color: 'var(--text-h)' }}>{item.message}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* ConfigurationService static parameters grid */}
        <div className="col-12">
          <div className="p-4 rounded-4 border-0" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <h4 className="fw-bold mb-3" style={{ color: 'var(--text-h)', fontSize: '1.25rem' }}>⚙️ ConfigurationService Values</h4>
            <div className="row g-4">
              <div className="col-md-6">
                <ul className="list-group gap-1">
                  {Object.entries(configData).map(([key, value]) => (
                    <li key={key} className="list-group-item d-flex justify-content-between py-2.5 px-3 border rounded-3" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                      <strong className="text-muted small">{key}:</strong>
                      <span className="fw-bold small" style={{ color: 'var(--text-h)' }}>{String(value)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col-md-6">
                <div className="p-3 border-0 rounded-4" style={{ background: 'var(--primary-light)', padding: '16px' }}>
                  <h6 className="fw-bold mb-3" style={{ color: 'var(--primary)' }}>Set/Override Configuration</h6>
                  <div className="d-flex flex-column gap-2 mb-3">
                    <input
                      type="text"
                      placeholder="Config Key"
                      className="form-control form-control-sm"
                      value={configKey}
                      onChange={(e) => setConfigKey(e.target.value)}
                      style={{ borderRadius: '8px', border: '1.5px solid var(--border)' }}
                    />
                    <input
                      type="text"
                      placeholder="Config Value"
                      className="form-control form-control-sm"
                      value={configVal}
                      onChange={(e) => setConfigVal(e.target.value)}
                      style={{ borderRadius: '8px', border: '1.5px solid var(--border)' }}
                    />
                  </div>
                  <button className="btn btn-primary btn-sm w-100 fw-bold py-2" onClick={handleConfigSet} style={{ borderRadius: '8px', background: 'var(--primary)', border: 'none' }}>Update Config</button>
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

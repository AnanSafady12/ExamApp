// LoggerService stores logs in memory and caps them to a maximum size
class LoggerService {
  constructor(maxLogs = 10) {
    this.maxLogs = maxLogs;
    this.logs = [];
  }

  // Adds a log entry with a timestamp and removes the oldest if cap is exceeded
  _addLog(type, message) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, type, message };
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    return logEntry;
  }

  // Log an info level message
  info(message) {
    return this._addLog('INFO', message);
  }

  // Log a success level message
  success(message) {
    return this._addLog('SUCCESS', message);
  }

  // Log an error level message
  error(message) {
    return this._addLog('ERROR', message);
  }

  // Log a warning level message
  warning(message) {
    return this._addLog('WARNING', message);
  }

  // Returns all logs currently stored
  getLogs() {
    return [...this.logs];
  }

  // Empties the log list
  clearLogs() {
    this.logs = [];
  }
}

const loggerService = new LoggerService();
export { LoggerService };
export default loggerService;

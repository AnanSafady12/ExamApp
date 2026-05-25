class LoggerService {
  constructor(maxLogs = 10) {
    this.maxLogs = maxLogs;
    this.logs = [];
  }

  _addLog(type, message) {
    const timestamp = new Date().toISOString();
    const logEntry = { timestamp, type, message };
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
    return logEntry;
  }

  info(message) {
    return this._addLog('INFO', message);
  }

  success(message) {
    return this._addLog('SUCCESS', message);
  }

  error(message) {
    return this._addLog('ERROR', message);
  }

  warning(message) {
    return this._addLog('WARNING', message);
  }

  getLogs() {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
  }
}

const loggerService = new LoggerService();
export { LoggerService };
export default loggerService;

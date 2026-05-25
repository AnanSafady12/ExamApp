import loggerService from './LoggerService';

class NotificationService {
  constructor() {
    this.listeners = [];
    this.history = [];
  }

  _notify(type, message) {
    const notification = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      message,
      timestamp: new Date().toISOString()
    };
    
    this.history.push(notification);
    
    if (type === 'SUCCESS') {
      loggerService.success(message);
    } else if (type === 'ERROR') {
      loggerService.error(message);
    } else if (type === 'WARNING') {
      loggerService.warning(message);
    }

    this.listeners.forEach(listener => listener(notification));
    return notification;
  }

  success(message) {
    return this._notify('SUCCESS', message);
  }

  error(message) {
    return this._notify('ERROR', message);
  }

  warning(message) {
    return this._notify('WARNING', message);
  }

  getHistory() {
    return [...this.history];
  }

  clearHistory() {
    this.history = [];
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }
}

const notificationService = new NotificationService();
export { NotificationService };
export default notificationService;

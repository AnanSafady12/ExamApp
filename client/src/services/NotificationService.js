import loggerService from './LoggerService';

// NotificationService sends real-time alerts and records their history
class NotificationService {
  constructor() {
    this.listeners = [];
    this.history = [];
  }

  // Generates alert object, logs it to LoggerService, and notifies subscribers
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
    } else if (type === 'INFO') {
      loggerService.info(message);
    }

    this.listeners.forEach(listener => listener(notification));
    return notification;
  }

  // Trigger a success notification
  success(message) {
    return this._notify('SUCCESS', message);
  }

  // Trigger an error notification
  error(message) {
    return this._notify('ERROR', message);
  }

  // Trigger a warning notification
  warning(message) {
    return this._notify('WARNING', message);
  }

  // Trigger an info notification
  info(message) {
    return this._notify('INFO', message);
  }

  // Get list of all notifications triggered
  getHistory() {
    return [...this.history];
  }

  // Wipe the notifications history
  clearHistory() {
    this.history = [];
  }

  // Subscribe to receive real-time notifications when they are triggered
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

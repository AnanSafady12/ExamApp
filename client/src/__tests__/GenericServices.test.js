import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../services/StorageService';
import { NotificationService } from '../services/NotificationService';
import { LoggerService } from '../services/LoggerService';
import { ConfigurationService } from '../services/ConfigurationService';

const TEST_PREFIX = 'test_generic_';

describe('StorageService', () => {
  let storage;

  beforeEach(() => {
    storage = new StorageService(TEST_PREFIX);
    storage.clear();
  });

  it('should save and get a value correctly', () => {
    storage.set('name', 'Alice');
    expect(storage.get('name')).toBe('Alice');
  });

  it('should return default value if key does not exist', () => {
    expect(storage.get('nonexistent', 'default_val')).toBe('default_val');
  });

  it('should remove a value correctly', () => {
    storage.set('age', 25);
    storage.remove('age');
    expect(storage.get('age')).toBeNull();
  });

  it('should clear only prefixed keys', () => {
    storage.set('a', 1);
    localStorage.setItem('outside_key', 'outside');
    storage.clear();
    expect(storage.get('a')).toBeNull();
    expect(localStorage.getItem('outside_key')).toBe('outside');
    localStorage.removeItem('outside_key');
  });
});

describe('LoggerService', () => {
  let logger;

  beforeEach(() => {
    logger = new LoggerService(5);
  });

  it('should add different log types correctly', () => {
    const infoLog = logger.info('info message');
    const successLog = logger.success('success message');
    const errorLog = logger.error('error message');
    const warningLog = logger.warning('warning message');

    expect(infoLog.type).toBe('INFO');
    expect(infoLog.message).toBe('info message');
    expect(successLog.type).toBe('SUCCESS');
    expect(errorLog.type).toBe('ERROR');
    expect(warningLog.type).toBe('WARNING');
  });

  it('should keep only the last N logs', () => {
    for (let i = 1; i <= 7; i++) {
      logger.info(`log ${i}`);
    }
    const logs = logger.getLogs();
    expect(logs.length).toBe(5);
    expect(logs[0].message).toBe('log 3');
    expect(logs[4].message).toBe('log 7');
  });

  it('should clear logs successfully', () => {
    logger.info('log');
    logger.clearLogs();
    expect(logger.getLogs().length).toBe(0);
  });
});

describe('NotificationService', () => {
  let notifier;

  beforeEach(() => {
    notifier = new NotificationService();
  });

  it('should trigger notification and log to history correctly', () => {
    const successNotif = notifier.success('Operation succeeded');
    const errorNotif = notifier.error('Operation failed');
    const warningNotif = notifier.warning('Operation warning');

    expect(successNotif.type).toBe('SUCCESS');
    expect(successNotif.message).toBe('Operation succeeded');
    expect(errorNotif.type).toBe('ERROR');
    expect(warningNotif.type).toBe('WARNING');

    const history = notifier.getHistory();
    expect(history.length).toBe(3);
    expect(history[0].id).toBe(successNotif.id);
  });

  it('should dispatch notification to subscribers', () => {
    let triggered = null;
    const unsubscribe = notifier.subscribe((n) => {
      triggered = n;
    });

    const notif = notifier.success('Hello');
    expect(triggered).toEqual(notif);

    unsubscribe();
    notifier.success('World');
    expect(triggered).toEqual(notif);
  });
});

describe('ConfigurationService', () => {
  let config;

  beforeEach(() => {
    config = new ConfigurationService();
  });

  it('should return correct default config values', () => {
    expect(config.get('appName')).toBe('E-Test System');
    expect(config.get('version')).toBe('1.1.0');
    expect(config.get('apiDelay')).toBe(600);
  });

  it('should return default value if key does not exist', () => {
    expect(config.get('invalid', 'fallback')).toBe('fallback');
  });

  it('should set and override config values correctly', () => {
    config.set('apiDelay', 100);
    expect(config.get('apiDelay')).toBe(100);
    config.set('newKey', 'newValue');
    expect(config.get('newKey')).toBe('newValue');
  });
});

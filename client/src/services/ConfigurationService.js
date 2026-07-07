import storageService from './StorageService';

const isTestEnv = typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.VITEST);

// ConfigurationService holds static and dynamic configuration settings for the app
class ConfigurationService {
  constructor() {
    this.config = {
      appName: 'E-Test System',
      version: '1.1.0',
      defaultRole: 'STUDENT',
      apiDelay: 600,
      maxLogs: 10,
      useServer: true,
      serverUrl: 'http://localhost:3001'
    };

    if (isTestEnv) {
      this.config.useServer = false;
    } else {
      try {
        const overrides = storageService.get('config_overrides', {});
        this.config = { ...this.config, ...overrides };
      } catch (e) {
        console.warn('Failed to load configuration overrides:', e);
      }
    }
  }

  // Get a specific config value, or fallback to the defaultValue if key doesn't exist
  get(key, defaultValue = null) {
    return key in this.config ? this.config[key] : defaultValue;
  }

  // Change or add a new configuration setting dynamically
  set(key, value) {
    let parsedValue = value;
    if (value === 'true' || value === true) parsedValue = true;
    else if (value === 'false' || value === false) parsedValue = false;
    else if (value !== '' && !isNaN(value)) parsedValue = Number(value);

    this.config[key] = parsedValue;

    if (!isTestEnv) {
      try {
        const overrides = storageService.get('config_overrides', {});
        overrides[key] = parsedValue;
        storageService.set('config_overrides', overrides);
      } catch (e) {
        console.warn('Failed to save configuration overrides:', e);
      }
    }
  }

  // Return a copy of the entire config object
  getAll() {
    return { ...this.config };
  }
}

const configurationService = new ConfigurationService();
export { ConfigurationService };
export default configurationService;

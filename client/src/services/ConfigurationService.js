// ConfigurationService holds static and dynamic configuration settings for the app
class ConfigurationService {
  constructor() {
    this.config = {
      appName: 'E-Test System',
      version: '1.1.0',
      defaultRole: 'STUDENT',
      apiDelay: 600,
      maxLogs: 10
    };
  }

  // Get a specific config value, or fallback to the defaultValue if key doesn't exist
  get(key, defaultValue = null) {
    return key in this.config ? this.config[key] : defaultValue;
  }

  // Change or add a new configuration setting dynamically
  set(key, value) {
    this.config[key] = value;
  }

  // Return a copy of the entire config object
  getAll() {
    return { ...this.config };
  }
}

const configurationService = new ConfigurationService();
export { ConfigurationService };
export default configurationService;

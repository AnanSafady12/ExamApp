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

  get(key, defaultValue = null) {
    return key in this.config ? this.config[key] : defaultValue;
  }

  set(key, value) {
    this.config[key] = value;
  }

  getAll() {
    return { ...this.config };
  }
}

const configurationService = new ConfigurationService();
export { ConfigurationService };
export default configurationService;

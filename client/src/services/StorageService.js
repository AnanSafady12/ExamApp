const STORAGE_PREFIX = 'examapp_';

class StorageService {
  constructor(prefix = STORAGE_PREFIX) {
    this.prefix = prefix;
  }

  _key(key) {
    return `${this.prefix}${key}`;
  }

  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(this._key(key));
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  set(key, value) {
    try {
      localStorage.setItem(this._key(key), JSON.stringify(value));
    } catch {
    }
  }

  remove(key) {
    try {
      localStorage.removeItem(this._key(key));
    } catch {
    }
  }

  clear() {
    try {
      const keys = Object.keys(localStorage).filter(k => k.startsWith(this.prefix));
      keys.forEach(k => localStorage.removeItem(k));
    } catch {
    }
  }
}

const storageService = new StorageService();
export { StorageService };
export default storageService;

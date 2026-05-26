// The prefix helps avoid key clashes in localStorage between apps
const STORAGE_PREFIX = 'examapp_';

// StorageService simplifies saving/loading data from localStorage with JSON support
class StorageService {
  constructor(prefix = STORAGE_PREFIX) {
    this.prefix = prefix;
  }

  // Appends prefix to key to keep keys namespaced
  _key(key) {
    return `${this.prefix}${key}`;
  }

  // Loads a key. If it doesn't exist or is corrupted, returns the default value
  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(this._key(key));
      return raw ? JSON.parse(raw) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  // Saves value under key by converting it into a JSON string
  set(key, value) {
    try {
      localStorage.setItem(this._key(key), JSON.stringify(value));
    } catch {
    }
  }

  // Removes a specific key from localStorage
  remove(key) {
    try {
      localStorage.removeItem(this._key(key));
    } catch {
    }
  }

  // Deletes only keys created by this application
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

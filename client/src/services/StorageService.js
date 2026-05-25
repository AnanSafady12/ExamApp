const STORAGE_PREFIX = 'examapp_';

class StorageService {
  constructor(prefix = STORAGE_PREFIX) {
    this.prefix = prefix;
  }

  _key(key) {
    return `${this.prefix}${key}`;
  }

  get(key) {
    try {
      const raw = localStorage.getItem(this._key(key));
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  set(key, value) {
    localStorage.setItem(this._key(key), JSON.stringify(value));
  }

  remove(key) {
    localStorage.removeItem(this._key(key));
  }

  clear() {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(this.prefix));
    keys.forEach(k => localStorage.removeItem(k));
  }
}

const storageService = new StorageService();
export { StorageService };
export default storageService;

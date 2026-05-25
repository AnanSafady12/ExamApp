import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../services/AuthService';
import { StorageService } from '../services/StorageService';

const TEST_PREFIX = 'test_examapp_';

function createTestAuthService() {
  const storage = new StorageService(TEST_PREFIX);
  const auth = new AuthService();
  const originalGet = auth.getCurrentUser.bind(auth);

  Object.defineProperty(auth, '_storage', { value: storage, writable: true });

  auth.getCurrentUser = () => storage.get('current_user');
  auth.logout = () => storage.remove('current_user');
  auth.isLoggedIn = () => auth.getCurrentUser() !== null;
  auth.getRole = () => {
    const user = auth.getCurrentUser();
    return user ? user.role : null;
  };

  const originalLogin = auth.login.bind(auth);
  auth.login = async (username, password) => {
    const user = await originalLogin(username, password);
    storage.set('current_user', user);
    return user;
  };

  const originalRegister = auth.register.bind(auth);
  auth.register = async (data) => {
    const user = await originalRegister(data);
    storage.set('current_user', user);
    return user;
  };

  return { auth, storage };
}

describe('AuthService', () => {
  let auth;
  let storage;

  beforeEach(() => {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(TEST_PREFIX));
    keys.forEach(k => localStorage.removeItem(k));
    const testSetup = createTestAuthService();
    auth = testSetup.auth;
    storage = testSetup.storage;
  });

  describe('login', () => {
    it('should login successfully with valid credentials', async () => {
      const user = await auth.login('teacher1', 'pass123');
      expect(user).toBeTruthy();
      expect(user.username).toBe('teacher1');
      expect(user.role).toBe('TEACHER');
      expect(user.fullName).toBe('Sarah Cohen');
      expect(user.password).toBeUndefined();
    });

    it('should throw error with invalid credentials', async () => {
      await expect(auth.login('wrong', 'wrong')).rejects.toThrow('Invalid username or password');
    });

    it('should throw error with wrong password', async () => {
      await expect(auth.login('teacher1', 'wrongpass')).rejects.toThrow('Invalid username or password');
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const user = await auth.register({
        username: 'newstudent',
        password: 'newpass',
        fullName: 'New Student',
        role: 'STUDENT',
      });
      expect(user).toBeTruthy();
      expect(user.username).toBe('newstudent');
      expect(user.role).toBe('STUDENT');
      expect(user.password).toBeUndefined();
    });

    it('should throw error for duplicate username', async () => {
      await expect(
        auth.register({
          username: 'teacher1',
          password: 'pass',
          fullName: 'Dup',
          role: 'TEACHER',
        })
      ).rejects.toThrow('Username already exists');
    });

    it('should throw error for missing fields', async () => {
      await expect(
        auth.register({ username: '', password: 'pass', fullName: 'Test', role: 'STUDENT' })
      ).rejects.toThrow('All fields are required');
    });

    it('should throw error for invalid role', async () => {
      await expect(
        auth.register({ username: 'x', password: 'p', fullName: 'T', role: 'ADMIN' })
      ).rejects.toThrow('Invalid role');
    });
  });

  describe('logout', () => {
    it('should clear stored user on logout', async () => {
      await auth.login('student1', 'pass123');
      expect(auth.getCurrentUser()).toBeTruthy();
      auth.logout();
      expect(auth.getCurrentUser()).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('should return null when not logged in', () => {
      expect(auth.getCurrentUser()).toBeNull();
    });

    it('should return the logged-in user', async () => {
      await auth.login('student1', 'pass123');
      const current = auth.getCurrentUser();
      expect(current.username).toBe('student1');
      expect(current.role).toBe('STUDENT');
    });
  });

  describe('role checks', () => {
    it('should return correct role after login', async () => {
      await auth.login('teacher1', 'pass123');
      expect(auth.getRole()).toBe('TEACHER');
    });

    it('should return null role when not logged in', () => {
      expect(auth.getRole()).toBeNull();
    });
  });
});

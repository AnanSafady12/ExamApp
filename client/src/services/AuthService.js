import storageService from './StorageService';
import { findUserByCredentials, createUser, ROLES } from '../api/userService';

const AUTH_KEY = 'current_user';

class AuthService {
  async login(username, password) {
    const user = await findUserByCredentials(username, password);
    if (!user) {
      throw new Error('Invalid username or password');
    }
    storageService.set(AUTH_KEY, user);
    return user;
  }

  async register({ username, password, fullName, role }) {
    if (!username || !password || !fullName) {
      throw new Error('All fields are required');
    }
    if (!Object.values(ROLES).includes(role)) {
      throw new Error('Invalid role');
    }

    const result = await createUser({ username, password, fullName, role });
    if (result.error) {
      throw new Error(result.error);
    }
    storageService.set(AUTH_KEY, result);
    return result;
  }

  logout() {
    storageService.remove(AUTH_KEY);
  }

  getCurrentUser() {
    return storageService.get(AUTH_KEY);
  }

  isLoggedIn() {
    return this.getCurrentUser() !== null;
  }

  getRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  isTeacher() {
    return this.getRole() === ROLES.TEACHER;
  }

  isStudent() {
    return this.getRole() === ROLES.STUDENT;
  }
}

const authService = new AuthService();
export { AuthService, ROLES };
export default authService;

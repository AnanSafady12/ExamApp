import storageService from './StorageService';
import { findUserByCredentials, createUser, ROLES } from '../api/userService';

// Key used to store the logged-in user in localStorage
const AUTH_KEY = 'current_user';

// AuthService handles logging in, registering, and tracking active roles
class AuthService {
  // Checks credentials against the mock API and saves user to local storage if correct
  async login(username, password) {
    const user = await findUserByCredentials(username, password);
    if (!user) {
      throw new Error('Invalid username or password');
    }
    storageService.set(AUTH_KEY, user);
    return user;
  }

  // Performs basic inputs validation and registers a new user in the mock DB
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

  // Deletes user from local storage to log out
  logout() {
    storageService.remove(AUTH_KEY);
  }

  // Retrieves the current authenticated user object
  getCurrentUser() {
    return storageService.get(AUTH_KEY);
  }

  // Helper to check if a user session is active
  isLoggedIn() {
    return this.getCurrentUser() !== null;
  }

  // Retrieves the role of the logged-in user
  getRole() {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  // Checks if the user is a teacher
  isTeacher() {
    return this.getRole() === ROLES.TEACHER;
  }

  // Checks if the user is a student
  isStudent() {
    return this.getRole() === ROLES.STUDENT;
  }
}

const authService = new AuthService();
export { AuthService, ROLES };
export default authService;

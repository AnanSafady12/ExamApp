import { users, ROLES } from './mockDb';
import configurationService from '../services/ConfigurationService';

const FAKE_DELAY = 400;

const simulateRequest = (data, delay = FAKE_DELAY) =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay));

export const findUserByCredentials = async (username, password) => {
  if (configurationService.get('useServer')) {
    try {
      const serverUrl = configurationService.get('serverUrl');
      const response = await fetch(`${serverUrl}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (response.status === 401) return null;
      if (!response.ok) {
        throw new Error('Server connection error');
      }
      return await response.json();
    } catch (error) {
      console.error('API Error in findUserByCredentials:', error);
      return null;
    }
  }

  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) return simulateRequest(null);
  const { password: _, ...safeUser } = user;
  return simulateRequest(safeUser);
};

export const findUserByUsername = async (username) => {
  if (configurationService.get('useServer')) {
    try {
      const serverUrl = configurationService.get('serverUrl');
      const response = await fetch(`${serverUrl}/api/users/${username}`);
      if (response.status === 404) return null;
      if (!response.ok) {
        throw new Error('Server connection error');
      }
      return await response.json();
    } catch (error) {
      console.error('API Error in findUserByUsername:', error);
      return null;
    }
  }

  const user = users.find((u) => u.username === username);
  return simulateRequest(user || null);
};

export const createUser = async (userData) => {
  if (configurationService.get('useServer')) {
    try {
      const serverUrl = configurationService.get('serverUrl');
      const response = await fetch(`${serverUrl}/api/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      if (response.status === 400 && data.error) {
        return { error: data.error };
      }
      if (!response.ok) {
        throw new Error(data.error || 'Server registration error');
      }
      return data;
    } catch (error) {
      console.error('API Error in createUser:', error);
      return { error: 'Failed to connect to the server' };
    }
  }

  const exists = users.find((u) => u.username === userData.username);
  if (exists) return simulateRequest({ error: 'Username already exists' });

  const newUser = {
    ...userData,
    id: users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1,
  };
  users.push(newUser);
  const { password: _, ...safeUser } = newUser;
  return simulateRequest(safeUser);
};

export { ROLES };

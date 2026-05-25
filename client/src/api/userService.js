import { users, ROLES } from './mockDb';

const FAKE_DELAY = 400;

const simulateRequest = (data, delay = FAKE_DELAY) =>
  new Promise((resolve) => setTimeout(() => resolve(data), delay));

export const findUserByCredentials = (username, password) => {
  const user = users.find(
    (u) => u.username === username && u.password === password
  );
  if (!user) return simulateRequest(null);
  const { password: _, ...safeUser } = user;
  return simulateRequest(safeUser);
};

export const findUserByUsername = (username) => {
  const user = users.find((u) => u.username === username);
  return simulateRequest(user || null);
};

export const createUser = (userData) => {
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

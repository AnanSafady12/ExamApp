import pool from '../db/connect.js';

class UserService {
  async getUserByUsername(username) {
    const result = await pool.query(
      'SELECT id, username, password, role, name, name AS "fullName" FROM users WHERE LOWER(username) = LOWER($1)',
      [username]
    );
    return result.rows[0];
  }

  async registerUser(username, hashedPassword, fullName, role) {
    const result = await pool.query(
      'INSERT INTO users (username, password, name, role) VALUES ($1, $2, $3, $4) RETURNING id, username, role, name, name AS "fullName"',
      [username, hashedPassword, fullName, role]
    );
    return result.rows[0];
  }
}

export default new UserService();

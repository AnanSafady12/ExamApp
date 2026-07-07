import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import UserService from '../services/UserService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_123';

class UserController {
  async register(req, res) {
    try {
      const { username, password, fullName, role } = req.body;

      if (!username || !password || !fullName || !role) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      if (role !== 'TEACHER' && role !== 'STUDENT') {
        return res.status(400).json({ error: 'Invalid role' });
      }

      const existingUser = await UserService.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      const hashedPassword = bcrypt.hashSync(password, 10);
      const newUser = await UserService.registerUser(username, hashedPassword, fullName, role);

      const token = jwt.sign(
        { id: newUser.id, username: newUser.username, role: newUser.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        id: newUser.id,
        username: newUser.username,
        role: newUser.role,
        fullName: newUser.fullName,
        name: newUser.fullName,
        token
      });
    } catch (error) {
      console.error('Error in register controller:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      const user = await UserService.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }

      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        name: user.fullName,
        token
      });
    } catch (error) {
      console.error('Error in login controller:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getProfile(req, res) {
    try {
      const { username } = req.params;
      const user = await UserService.getUserByUsername(username);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        fullName: user.fullName,
        name: user.fullName
      });
    } catch (error) {
      console.error('Error in getProfile controller:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new UserController();

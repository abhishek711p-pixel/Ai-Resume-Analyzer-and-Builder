/**
 * Authentication Controller
 * 
 * Handles user identity actions:
 * 1. User registration (Signup) with bcrypt hashing
 * 2. User login with hashed password comparison
 * 3. JWT token generation and validation
 * 4. User profile retrieval & modification
 * 5. Dev-only database state cleanup
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';


const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey_resuai_2026';

/**
 * @desc    Register a new user
 * @route   POST /api/auth/signup
 * @access  Public
 */
export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body;

    // 1. Validation
    if (!email || !password || !username) {
      res.status(400).json({ message: 'Please provide username, email, and password.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters long.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(400).json({ message: 'An account with this email address already exists. Please sign in instead.' });
      return;
    }

    // 3. Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create User in MongoDB
    const newUser = await User.create({
      username: username.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    // 5. Generate JWT Token
    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Account created successfully!',
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }
    });
  } catch (error: any) {
    console.error('[Auth Controller] Signup Error:', error);
    if (error.code === 11000) {
      res.status(400).json({ message: 'An account with this email address already exists.' });
      return;
    }
    res.status(500).json({ message: 'Server error during signup. Please try again later.' });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // 1. Validation
    if (!email || !password) {
      res.status(400).json({ message: 'Please enter both email and password.' });
      return;
    }

    const normalizedEmail = email.toLowerCase().trim();

    // 2. Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(400).json({ message: 'Invalid email or password. Please check your credentials and try again.' });
      return;
    }

    // 3. Verify password hash using bcrypt
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      res.status(400).json({ message: 'Invalid email or password. Please check your credentials and try again.' });
      return;
    }

    // 4. Generate JWT Token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Logged in successfully!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('[Auth Controller] Login Error:', error);
    res.status(500).json({ message: 'Server error during login. Please try again later.' });
  }
};

/**
 * @desc    Get current user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: 'Unauthorized. No token provided.' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded: any = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      res.status(404).json({ message: 'User profile not found.' });
      return;
    }

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        fullName: user.fullName || '',
        location: user.location || '',
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

/**
 * @desc    Clear all user data from database (Fresh Start)
 * @route   DELETE /api/auth/clear-all
 * @access  Public / Dev
 */
export const clearAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await User.deleteMany({});
    res.status(200).json({
      message: 'All user data has been cleared successfully. Ready for a fresh start!',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('[Auth Controller] Clear Users Error:', error);
    res.status(500).json({ message: 'Failed to clear user data.' });
  }
};

/**
 * @desc    Update user profile details
 * @route   PUT /api/auth/update-profile
 * @access  Private
 */
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized. User token missing.' });
      return;
    }

    const { username, email, password, fullName, location } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    if (username) {
      user.username = username.trim();
    }

    if (email) {
      const normalizedEmail = email.toLowerCase().trim();
      if (normalizedEmail !== user.email) {
        // Check if email already in use
        const emailExists = await User.findOne({ email: normalizedEmail });
        if (emailExists) {
          res.status(400).json({ message: 'Email address is already in use.' });
          return;
        }
        user.email = normalizedEmail;
      }
    }

    if (password) {
      if (password.length < 6) {
        res.status(400).json({ message: 'Password must be at least 6 characters long.' });
        return;
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    if (fullName !== undefined) {
      user.fullName = fullName.trim();
    }

    if (location !== undefined) {
      user.location = location.trim();
    }

    const updatedUser = await user.save();

    // Re-generate JWT Token
    const token = jwt.sign(
      { userId: updatedUser._id, email: updatedUser.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Profile updated successfully!',
      token,
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        location: updatedUser.location
      }
    });
  } catch (error) {
    console.error('[Auth Controller] Update Profile Error:', error);
    res.status(500).json({ message: 'Server error during profile update. Please try again later.' });
  }
};


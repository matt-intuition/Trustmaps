import { Router, Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import passport from 'passport';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../../config/database';
import { generateToken } from '../auth/jwt';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../../uploads/profiles');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer configuration for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const user = req.user as any;
    const ext = path.extname(file.originalname);
    cb(null, `${user.id}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  },
});

// Validation middleware
const signupValidation = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('displayName')
    .isLength({ min: 1, max: 50 })
    .withMessage('Display name is required and must be less than 50 characters')
];

const loginValidation = [
  body('email').notEmpty().withMessage('Email or username is required'),
  body('password').notEmpty().withMessage('Password is required')
];

// POST /api/auth/signup
router.post('/signup', signupValidation, async (req: Request, res: Response) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, username, password, displayName, bio } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }]
      }
    });

    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: existingUser.email === email
          ? 'Email is already registered'
          : 'Username is already taken'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        displayName,
        bio: bio || null,
        trustBalance: 100 // Starting TRUST balance
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        bio: true,
        profileImage: true,
        trustBalance: true,
        creatorReputation: true,
        totalStaked: true,
        createdAt: true
      }
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      username: user.username
    });

    res.status(201).json({
      message: 'User created successfully',
      token,
      user
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      error: 'Failed to create user',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/auth/login
router.post('/login', loginValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Use Passport local strategy
    passport.authenticate('local', { session: false }, (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).json({
          error: 'Authentication failed',
          message: info?.message || 'Incorrect credentials'
        });
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        username: user.username
      });

      res.json({
        message: 'Login successful',
        token,
        user
      });
    })(req, res, next);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/auth/me - Get current user profile
router.get(
  '/me',
  authenticateJWT,
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      // Fetch fresh user data with stats
      const userData = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          bio: true,
          profileImage: true,
          trustBalance: true,
          creatorReputation: true,
          totalStaked: true,
          createdAt: true,
          _count: {
            select: {
              createdLists: true,
              purchases: true,
              stakes: true,
              following: true,
              followers: true
            }
          }
        }
      });

      res.json({ user: userData });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        error: 'Failed to get profile',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

// PUT /api/auth/profile - Update user profile (displayName, bio)
router.put(
  '/profile',
  authenticateJWT,
  [
    body('displayName')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Display name must be between 1 and 50 characters'),
    body('bio')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Bio must be less than 500 characters'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const user = req.user as any;
      const { displayName, bio } = req.body;

      // Update user profile
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          ...(displayName !== undefined && { displayName }),
          ...(bio !== undefined && { bio }),
        },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          bio: true,
          profileImage: true,
          trustBalance: true,
          creatorReputation: true,
          totalStaked: true,
          createdAt: true,
          _count: {
            select: {
              createdLists: true,
              purchases: true,
              stakes: true,
            },
          },
        },
      });

      res.json({
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        error: 'Failed to update profile',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// POST /api/auth/profile/image - Upload profile image
router.post(
  '/profile/image',
  authenticateJWT,
  upload.single('image'),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      if (!req.file) {
        return res.status(400).json({
          error: 'No file uploaded',
          message: 'Please provide an image file',
        });
      }

      // Generate URL for the uploaded image
      const imageUrl = `${process.env.API_URL || 'http://localhost:3001'}/uploads/profiles/${req.file.filename}`;

      // Update user's profile image
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { profileImage: imageUrl },
        select: {
          id: true,
          email: true,
          username: true,
          displayName: true,
          bio: true,
          profileImage: true,
          trustBalance: true,
          creatorReputation: true,
          totalStaked: true,
          createdAt: true,
          _count: {
            select: {
              createdLists: true,
              purchases: true,
              stakes: true,
            },
          },
        },
      });

      res.json({
        message: 'Profile image uploaded successfully',
        user: updatedUser,
      });
    } catch (error) {
      console.error('Upload profile image error:', error);
      res.status(500).json({
        error: 'Failed to upload image',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

export default router;

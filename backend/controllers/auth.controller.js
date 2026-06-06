// controllers/auth.controller.js
// Handles register, login, profile, onboarding

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { sendSuccess, sendError } = require('../utils/response');

// ─── Generate JWT Token ───────────────────────
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

// ─── REGISTER ─────────────────────────────────
// POST /api/auth/register
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

    // Check all fields exist
        if (!name || !email || !password) {
            return sendError(res, 'Please provide name, email and password', 400);
        }

    // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return sendError(res, 'Email already registered', 400);
        }

    // Create new user
    // Password gets hashed automatically by User model pre-save hook
        const user = await User.create({ name, email, password });

    // Generate token
        const token = generateToken(user._id);

        return sendSuccess(res, {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                onboardingDone: user.onboardingDone,
                theme: user.theme
            }
        }, 'Registration successful', 201);

    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── LOGIN ────────────────────────────────────
// POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

    // Check fields exist
        if (!email || !password) {
            return sendError(res, 'Please provide email and password', 400);
        }

    // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return sendError(res, 'Invalid email or password', 401);
        }

    // Check password using our model method
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return sendError(res, 'Invalid email or password', 401);
        }

    // Generate token
        const token = generateToken(user._id);
        return sendSuccess(res, {
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                onboardingDone: user.onboardingDone,
                theme: user.theme,
                goal: user.goal,
                streak: user.streak
            }
        }, 'Login successful');

    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── GET PROFILE ──────────────────────────────
// GET /api/auth/profile
const getProfile = async (req, res) => {
    try {
    // req.userId comes from auth middleware
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return sendError(res, 'User not found', 404);
        }
        return sendSuccess(res, { user }, 'Profile fetched');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── UPDATE PROFILE ───────────────────────────
// PUT /api/auth/profile
const updateProfile = async (req, res) => {
    try {
        const { name, theme, sleepTime, wakeTime } = req.body;

        const user = await User.findByIdAndUpdate(
            req.userId,
            { name, theme, sleepTime, wakeTime },
            { new: true }
        ).select('-password');
        return sendSuccess(res, { user }, 'Profile updated');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── COMPLETE ONBOARDING ──────────────────────
// POST /api/auth/onboarding
const completeOnboarding = async (req, res) => {
    try {
        const {
            isStudent,
            studyField,
            profession,
            hasGoal,
            goal,
            goalDuration,
            sleepTime,
            wakeTime
        } = req.body;
        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                isStudent,
                studyField,
                profession,
                hasGoal,
                goal,
                goalDuration,
                sleepTime,
                wakeTime,
                onboardingDone: true
            },
            { new: true }
        ).select('-password');
        return sendSuccess(res, { user }, 'Onboarding completed');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    completeOnboarding
};
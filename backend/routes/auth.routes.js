// routes/auth.routes.js
const router = require('express').Router();
const {
    register,
    login,
    getProfile,
    updateProfile,
    completeOnboarding
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

// Public Routes
router.post('/register', register);
router.post('/login', login);

// Protected Routes
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/onboarding', protect, completeOnboarding);

module.exports = router;

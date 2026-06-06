// models/User.js
// This defines what a User looks like in our database

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: 6
    },
    isStudent: {
        type: Boolean,
        default: true
    },
    studyField: {
        type: String,
        default: ''
    },
    profession: {
        type: String,
        default: ''
    },
    hasGoal: {
        type: Boolean,
        default: false
    },
    goal: {
        type: String,
        default: ''
    },
    goalDuration: {
        type: String,
        default: ''
    },
// Sleep Schedule
    sleepTime: {
        type: String,
        default: '22:00'
    },
    wakeTime: {
        type: String,
        default: '06:00'
    },
// Productivity Stats
    streak: {
        type: Number,
        default: 0
    },
    lastActiveDate: {
        type: String,
        default: ''
    },
    totalTasksCompleted: {
        type: Number,
        default: 0
    },
    productivityScore: {
        type: Number,
        default: 0
    },
// Onboarding completed?
    onboardingDone: {
        type: Boolean,
        default: false
    },
// Theme preference
    theme: {
        type: String,
        enum: ['light', 'dark'],
        default: 'light'
    }
}, {
  timestamps: true // adds createdAt and updatedAt automatically
});

// ─── Hash password before saving ─────────────
// This runs automatically before every save
UserSchema.pre('save', async function() {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


// ─── Method to check password ─────────────────
// Used during login to compare entered password with stored hash
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
// models/FocusSession.js
// Stores focus/pomodoro timer sessions

const mongoose = require('mongoose');

const FocusSessionSchema = new mongoose.Schema({
  // Which user owns this session
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

  // Session details
    date: {
        type: String,
        required: true
    },

  // Timer settings
    duration: {
        type: Number,
        required: true,
        enum: [15, 25, 45, 60],
        default: 25
    },

  // How long user actually focused in minutes
    actualDuration: {
        type: Number,
        default: 0
    },

  // Session status
    status: {
        type: String,
        enum: ['active', 'completed', 'abandoned'],
        default: 'active'
    },

  // What user was studying
    subject: {
        type: String,
        default: ''
    },

  // Notes taken during session
    sessionNotes: {
        type: String,
        default: ''
    },

  // Doubts asked during session
    doubts: [{
        question: {
            type: String,
            default: ''
        },
        answer: {
            type: String,
            default: ''
        },
        askedAt: {
            type: Date,
            default: Date.now
        }
    }],

  // Music played during session
    musicPlayed: {
        type: String,
        enum: ['lofi', 'rain', 'nature', 'piano', 'none'],
        default: 'none'
    },

  // Distractions count
    distractionsCount: {
        type: Number,
        default: 0
    },

  // Timer state for persistence across pages
    timerState: {
        timeRemaining: {
            type: Number,
            default: 0
        },
        isRunning: {
            type: Boolean,
            default: false
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        }
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('FocusSession', FocusSessionSchema);
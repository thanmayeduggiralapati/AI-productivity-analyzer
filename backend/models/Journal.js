// models/Journal.js
// Stores daily journal entries
// Each entry is one day for one user

const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema({
  // Which user wrote this journal
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

  // The date of this journal entry (YYYY-MM-DD)
    date: {
        type: String,
        required: true
    },

  // What the user wrote
    content: {
        type: String,
        required: [true, 'Journal content is required'],
        trim: true
    },

  // Mood of the day
    mood: {
        type: String,
        enum: ['great', 'good', 'okay', 'bad', 'terrible'],
        default: 'okay'
    },

  // Energy level 1-10
    energyLevel: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
    },

  // Tasks extracted by AI from this journal
    extractedTasks: [
    {
        title: String,
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium'
        },
        category: {
            type: String,
            default: 'personal'
        },
        goalAligned: {
            type: Boolean,
            default: false
        },
        location: {
            type: String,
            default: ''
        },
        estimatedDuration: {
            type: Number,
            default: 30
        }
    }],

  // Daily reflection
    reflection: {
        type: String,
        default: ''
    },

  // Gratitude notes
    gratitude: {
        type: String,
        default: ''
    },

  // Was AI used to extract tasks
    aiProcessed: {
        type: Boolean,
        default: false
    },

  // Productivity score for this day
    dailyScore: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// One journal entry per user per day
JournalSchema.index({ user: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Journal', JournalSchema);
// models/Task.js
// This defines what a Task looks like in our database

const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  // Which user does this task belong to
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

  // Basic Task Info
    title: {
        type: String,
        required: [true, 'Task title is required'],
        trim: true
    },
    description: {
        type: String,
        default: ''
    },

  // Priority Level
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },

  // Task Category
    category: {
        type: String,
        enum: ['study', 'work', 'personal', 'health', 'travel', 'other'],
        default: 'personal'
    },

  // Status
    status: {
        type: String,
        enum: ['pending', 'completed', 'skipped', 'carried_forward'],
        default: 'pending'
    },

  // Dates
    scheduledDate: {
        type: String,
        required: true
    },
    completedAt: {
        type: Date,
        default: null
    },
    deadline: {
        type: Date,
        default: null
    },

  // Goal Alignment
    goalAligned: {
        type: Boolean,
        default: false
    },

  // Was this extracted from journal by AI
    extractedFromJournal: {
        type: Boolean,
        default: false
    },

  // Travel specific
    location: {
        type: String,
        default: ''
    },
    travelMode: {
        type: String,
        enum: ['driving', 'walking', 'cycling', 'transit', ''],
        default: ''
    },
    departureTime: {
        type: String,
        default: ''
    },

  // Carry forward tracking
    originalDate: {
        type: String,
        default: ''
    },
    carriedForwardCount: {
        type: Number,
        default: 0
    },

  // AI estimated duration in minutes
    estimatedDuration: {
        type: Number,
        default: 30
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Task', TaskSchema);
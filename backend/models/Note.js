// models/Note.js
// Stores user notes with AI key points extraction

const mongoose = require('mongoose');

const NoteSchema = new mongoose.Schema({
  // Which user owns this note
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

  // Note details
    title: {
        type: String,
        required: [true, 'Note title is required'],
        trim: true
    },
    content: {
        type: String,
        default: ''
    },

  // Tags for organizing notes
    tags: [{
        type: String,
        trim: true
    }],

  // AI extracted key points
    keyPoints: [{
        type: String,
        trim: true
    }],

  // Was key points extracted by AI
    aiProcessed: {
        type: Boolean,
        default: false
    },

  // Note category
    category: {
        type: String,
        enum: ['study', 'work', 'personal', 'other'],
        default: 'study'
    },

  // Is this note pinned
    isPinned: {
        type: Boolean,
        default: false
    },

  // Color for UI
    color: {
        type: String,
        default: '#ffffff'
    },

  // Linked to which subject or topic
    subject: {
        type: String,
        default: ''
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('Note', NoteSchema);
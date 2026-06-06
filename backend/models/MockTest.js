// models/MockTest.js
// Stores AI generated mock tests and results

const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  // Question text
    question: {
        type: String,
        required: true
    },

  // Multiple choice options
    options: [{
        type: String
    }],

  // Correct answer
    correctAnswer: {
        type: String,
        required: true
    },

  // Explanation for the answer
    explanation: {
        type: String,
        default: ''
    },

  // Was this question answered correctly
    userAnswer: {
        type: String,
        default: ''
    },

    isCorrect: {
        type: Boolean,
        default: false
    }
});

const MockTestSchema = new mongoose.Schema({
  // Which user owns this test
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

  // Test details
    title: {
        type: String,
        required: true,
        trim: true
    },

  // What topic this test is about
    topic: {
        type: String,
        required: true,
        trim: true
    },

  // Where was this test generated from
    source: {
        type: String,
        enum: ['topic', 'notes', 'doubt', 'text'],
        default: 'topic'
    },

  // Questions array
    questions: [QuestionSchema],

  // Test results
    score: {
        type: Number,
        default: 0
    },
    totalQuestions: {
        type: Number,
        default: 0
    },
    correctAnswers: {
        type: Number,
        default: 0
    },
    percentage: {
        type: Number,
        default: 0
    },

  // Test status
    status: {
        type: String,
        enum: ['generated', 'in_progress', 'completed'],
        default: 'generated'
    },

  // Time taken in minutes
    timeTaken: {
        type: Number,
        default: 0
    },

  // Mistakes to review later
    mistakesToReview: [{
        question: String,
        correctAnswer: String,
        userAnswer: String,
        explanation: String
    }],

  // Difficulty level
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    }

}, {
    timestamps: true
});

module.exports = mongoose.model('MockTest', MockTestSchema);
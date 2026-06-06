// controllers/focus.controller.js
// Handles focus/pomodoro timer sessions

const FocusSession = require('../models/FocusSession');
const { sendSuccess, sendError } = require('../utils/response');

// ─── START FOCUS SESSION ──────────────────────
// POST /api/focus/start
const startSession = async (req, res) => {
  try {
    const { duration, subject, musicPlayed } = req.body;

    if (!duration) {
      return sendError(res, 'Duration is required', 400);
    }

    // Check if there is already an active session
    const activeSession = await FocusSession.findOne({
      user: req.userId,
      status: 'active'
    });

    if (activeSession) {
      return sendSuccess(res, { session: activeSession }, 'Active session found');
    }

    const today = new Date().toISOString().split('T')[0];

    const session = await FocusSession.create({
      user: req.userId,
      date: today,
      duration,
      subject,
      musicPlayed,
      status: 'active',
      timerState: {
        timeRemaining: duration * 60,
        isRunning: true,
        lastUpdated: new Date()
      }
    });

    return sendSuccess(res, { session }, 'Focus session started', 201);

  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ─── UPDATE TIMER STATE ───────────────────────
// PUT /api/focus/:id/timer
const updateTimerState = async (req, res) => {
  try {
    const { timeRemaining, isRunning } = req.body;

    const session = await FocusSession.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      {
        timerState: {
          timeRemaining,
          isRunning,
          lastUpdated: new Date()
        }
      },
      { new: true }
    );

    if (!session) {
      return sendError(res, 'Session not found', 404);
    }

    return sendSuccess(res, { session }, 'Timer updated');

  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ─── COMPLETE SESSION ─────────────────────────
// PUT /api/focus/:id/complete
const completeSession = async (req, res) => {
  try {
    const { actualDuration, sessionNotes, distractionsCount } = req.body;

    const session = await FocusSession.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      {
        status: 'completed',
        actualDuration,
        sessionNotes,
        distractionsCount,
        timerState: {
          timeRemaining: 0,
          isRunning: false,
          lastUpdated: new Date()
        }
      },
      { new: true }
    );

    if (!session) {
      return sendError(res, 'Session not found', 404);
    }

    return sendSuccess(res, { session }, 'Session completed');

  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ─── ABANDON SESSION ──────────────────────────
// PUT /api/focus/:id/abandon
const abandonSession = async (req, res) => {
  try {
    const session = await FocusSession.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      {
        status: 'abandoned',
        timerState: {
          timeRemaining: 0,
          isRunning: false,
          lastUpdated: new Date()
        }
      },
      { new: true }
    );

    if (!session) {
      return sendError(res, 'Session not found', 404);
    }

    return sendSuccess(res, { session }, 'Session abandoned');

  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ─── GET ACTIVE SESSION ───────────────────────
// GET /api/focus/active
const getActiveSession = async (req, res) => {
  try {
    const session = await FocusSession.findOne({
      user: req.userId,
      status: 'active'
    });

    return sendSuccess(res, { session }, 'Active session fetched');

  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ─── GET SESSION HISTORY ──────────────────────
// GET /api/focus/history
const getSessionHistory = async (req, res) => {
  try {
    const sessions = await FocusSession.find({
      user: req.userId,
      status: 'completed'
    }).sort({ createdAt: -1 }).limit(20);

    return sendSuccess(res, { sessions }, 'Session history fetched');

  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

// ─── ADD DOUBT TO SESSION ─────────────────────
// POST /api/focus/:id/doubt
const addDoubt = async (req, res) => {
  try {
    const { question, answer } = req.body;

    if (!question) {
      return sendError(res, 'Question is required', 400);
    }

    const session = await FocusSession.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      {
        $push: {
          doubts: {
            question,
            answer,
            askedAt: new Date()
          }
        }
      },
      { new: true }
    );

    if (!session) {
      return sendError(res, 'Session not found', 404);
    }

    return sendSuccess(res, { session }, 'Doubt added');

  } catch (error) {
    return sendError(res, error.message, 500);
  }
};

module.exports = {
  startSession,
  updateTimerState,
  completeSession,
  abandonSession,
  getActiveSession,
  getSessionHistory,
  addDoubt
};
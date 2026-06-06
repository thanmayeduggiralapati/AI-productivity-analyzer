// controllers/note.controller.js
// Handles notes CRUD operations

const Note = require('../models/Note');
const { sendSuccess, sendError } = require('../utils/response');

// ─── CREATE NOTE ──────────────────────────────
// POST /api/notes
const createNote = async (req, res) => {
    try {
        const {
            title,
            content,
            tags,
            category,
            subject,
            color,
            isPinned
        } = req.body;
        if (!title) {
            return sendError(res, 'Note title is required', 400);
        }
        const note = await Note.create({
            user: req.userId,
            title,
            content,
            tags,
            category,
            subject,
            color,
            isPinned
        });
        return sendSuccess(res, { note }, 'Note created', 201);
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── GET ALL NOTES ────────────────────────────
// GET /api/notes
const getNotes = async (req, res) => {
    try {
        const { category, subject } = req.query;
        let filter = { user: req.userId };
        if (category) filter.category = category;
        if (subject) filter.subject = subject;
        const notes = await Note.find(filter).sort({ isPinned: -1, updatedAt: -1 });
        return sendSuccess(res, { notes }, 'Notes fetched');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── GET SINGLE NOTE ──────────────────────────
// GET /api/notes/:id
const getNote = async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            user: req.userId
        });
        if (!note) {
            return sendError(res, 'Note not found', 404);
        }
        return sendSuccess(res, { note }, 'Note fetched');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── UPDATE NOTE ──────────────────────────────
// PUT /api/notes/:id
const updateNote = async (req, res) => {
    try {
        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            req.body,
            { new: true }
        );
        if (!note) {
            return sendError(res, 'Note not found', 404);
        }
        return sendSuccess(res, { note }, 'Note updated');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── DELETE NOTE ──────────────────────────────
// DELETE /api/notes/:id
const deleteNote = async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });
        if (!note) {
            return sendError(res, 'Note not found', 404);
        }
        return sendSuccess(res, {}, 'Note deleted');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── SAVE AI KEY POINTS ───────────────────────
// PUT /api/notes/:id/keypoints
const saveKeyPoints = async (req, res) => {
    try {
        const { keyPoints } = req.body;
        if (!keyPoints || !keyPoints.length) {
            return sendError(res, 'Key points are required', 400);
        }
        const note = await Note.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            {
                keyPoints,
                aiProcessed: true
            },
            { new: true }
        );
        if (!note) {
            return sendError(res, 'Note not found', 404);
        }
        return sendSuccess(res, { note }, 'Key points saved');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── PIN/UNPIN NOTE ───────────────────────────
// PUT /api/notes/:id/pin
const togglePin = async (req, res) => {
    try {
        const note = await Note.findOne({
            _id: req.params.id,
            user: req.userId
        });
        if (!note) {
            return sendError(res, 'Note not found', 404);
        }
        note.isPinned = !note.isPinned;
        await note.save();
        return sendSuccess(res, { note }, note.isPinned ? 'Note pinned' : 'Note unpinned');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

module.exports = {
    createNote,
    getNotes,
    getNote,
    updateNote,
    deleteNote,
    saveKeyPoints,
    togglePin
};
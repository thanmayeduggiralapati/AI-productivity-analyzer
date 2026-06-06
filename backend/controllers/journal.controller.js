// controllers/journal.controller.js
// Handles journal entries and AI task extraction

const Journal = require('../models/Journal');
const Task = require('../models/Task');
const { sendSuccess, sendError } = require('../utils/response');

// ─── CREATE/UPDATE JOURNAL ────────────────────
// POST /api/journal
const createJournal = async (req, res) => {
    try {
        const {
            date,
            content,
            mood,
            energyLevel,
            reflection,
            gratitude
        } = req.body;
        if (!date || !content) {
            return sendError(res, 'Date and content are required', 400);
        }

    // Check if journal already exists for this date
        let journal = await Journal.findOne({
            user: req.userId,
            date
        });

        if (journal) {
      // Update existing journal
            journal.content = content;
            journal.mood = mood || journal.mood;
            journal.energyLevel = energyLevel || journal.energyLevel;
            journal.reflection = reflection || journal.reflection;
            journal.gratitude = gratitude || journal.gratitude;
            await journal.save();
        } else {
      // Create new journal
            journal = await Journal.create({
                user: req.userId,
                date,
                content,
                mood,
                energyLevel,
                reflection,
                gratitude
            });
        }
        return sendSuccess(res, { journal }, 'Journal saved');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── GET TODAY'S JOURNAL ──────────────────────
// GET /api/journal/today
const getTodayJournal = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const journal = await Journal.findOne({
            user: req.userId,
            date: today
        });
        return sendSuccess(res, { journal }, 'Today journal fetched');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── GET JOURNAL HISTORY ──────────────────────
// GET /api/journal/history
const getJournalHistory = async (req, res) => {
    try {
        const journals = await Journal.find({
            user: req.userId
        }).sort({ date: -1 }).limit(30);
        return sendSuccess(res, { journals }, 'Journal history fetched');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── GET SINGLE JOURNAL ───────────────────────
// GET /api/journal/:date
const getJournalByDate = async (req, res) => {
    try {
        const journal = await Journal.findOne({
            user: req.userId,
            date: req.params.date
        });
        if (!journal) {
            return sendError(res, 'Journal not found', 404);
        }
        return sendSuccess(res, { journal }, 'Journal fetched');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── SAVE AI EXTRACTED TASKS ──────────────────
// POST /api/journal/save-tasks
const saveExtractedTasks = async (req, res) => {
    try {
        const { date, tasks } = req.body;
        if (!date || !tasks || !tasks.length) {
            return sendError(res, 'Date and tasks are required', 400);
        }

    // Save extracted tasks to journal
        const journal = await Journal.findOneAndUpdate(
            { user: req.userId, date },
            {
                extractedTasks: tasks,
                aiProcessed: true
            },
            { new: true }
        );

    // Also create actual Task documents
        const taskDocs = tasks.map(task => ({
            user: req.userId,
            title: task.title,
            priority: task.priority || 'medium',
            category: task.category || 'personal',
            scheduledDate: date,
            goalAligned: task.goalAligned || false,
            location: task.location || '',
            estimatedDuration: task.estimatedDuration || 30,
            extractedFromJournal: true
        }));

        await Task.insertMany(taskDocs);

        return sendSuccess(res, { journal }, 'Tasks saved from journal');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── GET JOURNAL STREAK ───────────────────────
// GET /api/journal/streak
const getStreak = async (req, res) => {
    try {
        const journals = await Journal.find({
            user: req.userId
        }).sort({ date: -1 });
        let streak = 0;
        let currentDate = new Date();
        for (let journal of journals) {
            const journalDate = new Date(journal.date);
            const diffDays = Math.floor(
                (currentDate - journalDate) / (1000 * 60 * 60 * 24)
            );
            if (diffDays <= 1) {
                streak++;
                currentDate = journalDate;
            } else {
                break;
            }
        }
        return sendSuccess(res, { streak }, 'Streak fetched');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

module.exports = {
    createJournal,
    getTodayJournal,
    getJournalHistory,
    getJournalByDate,
    saveExtractedTasks,
    getStreak
};
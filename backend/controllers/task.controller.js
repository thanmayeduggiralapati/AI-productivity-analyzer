// controllers/task.controller.js
// Handles all task operations

const Task = require('../models/Task');
const { sendSuccess, sendError } = require('../utils/response');

// ─── CREATE TASK ──────────────────────────────
// POST /api/tasks
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            priority,
            category,
            scheduledDate,
            deadline,
            goalAligned,
            location,
            travelMode,
            departureTime,
            estimatedDuration
        } = req.body;
        if (!title || !scheduledDate) {
            return sendError(res, 'Title and scheduled date are required', 400);
        }
        const task = await Task.create({
            user: req.userId,
            title,
            description,
            priority,
            category,
            scheduledDate,
            deadline,
            goalAligned,
            location,
            travelMode,
            departureTime,
            estimatedDuration
        });
        return sendSuccess(res, { task }, 'Task created', 201);
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── GET ALL TASKS ────────────────────────────
// GET /api/tasks?date=2026-06-03
const getTasks = async (req, res) => {
    try {
        const { date, status, category } = req.query;

    // Build filter
        let filter = { user: req.userId };
        if (date) filter.scheduledDate = date;
        if (status) filter.status = status;
        if (category) filter.category = category;

        const tasks = await Task.find(filter).sort({ createdAt: -1 });

        return sendSuccess(res, { tasks }, 'Tasks fetched');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── GET SINGLE TASK ──────────────────────────
// GET /api/tasks/:id
const getTask = async (req, res) => {
    try {
        const task = await Task.findOne({
            _id: req.params.id,
            user: req.userId
        });

        if (!task) {
            return sendError(res, 'Task not found', 404);
        }
        return sendSuccess(res, { task }, 'Task fetched');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── UPDATE TASK ──────────────────────────────
// PUT /api/tasks/:id
const updateTask = async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            req.body,
            { new: true }
        );
        if (!task) {
            return sendError(res, 'Task not found', 404);
        }
        return sendSuccess(res, { task }, 'Task updated');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── DELETE TASK ──────────────────────────────
// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });
        if (!task) {
            return sendError(res, 'Task not found', 404);
        }
        return sendSuccess(res, {}, 'Task deleted');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── MARK TASK COMPLETE ───────────────────────
// PUT /api/tasks/:id/done
const markTaskDone = async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            {
                status: 'completed',
                completedAt: new Date()
            },
            { new: true }
        );
        if (!task) {
            return sendError(res, 'Task not found', 404);
        }

    // Update user streak and total completed
        const User = require('../models/User');
        await User.findByIdAndUpdate(req.userId, {
            $inc: { totalTasksCompleted: 1 }
        });
        return sendSuccess(res, { task }, 'Task marked complete');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── CARRY FORWARD TASK ───────────────────────
// PUT /api/tasks/:id/carry
const carryForwardTask = async (req, res) => {
    try {
        const { newDate } = req.body;
        if (!newDate) {
            return sendError(res, 'New date is required', 400);
        }
        const task = await Task.findOne({
            _id: req.params.id,
            user: req.userId
        });
        if (!task) {
            return sendError(res, 'Task not found', 404);
        }

    // Save original date if first time carrying forward
        const originalDate = task.originalDate || task.scheduledDate;

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            {
                scheduledDate: newDate,
                status: 'carried_forward',
                originalDate,
                $inc: { carriedForwardCount: 1 }
            },
            { new: true }
        );
        return sendSuccess(res, { task: updatedTask }, 'Task carried forward');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── SKIP TASK ────────────────────────────────
// PUT /api/tasks/:id/skip
const skipTask = async (req, res) => {
    try {
        const task = await Task.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            { status: 'skipped' },
            { new: true }
        );
        if (!task) {
            return sendError(res, 'Task not found', 404);
        }
        return sendSuccess(res, { task }, 'Task skipped');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── GET TASK HISTORY ─────────────────────────
// GET /api/tasks/history
const getTaskHistory = async (req, res) => {
    try {
        const tasks = await Task.find({
            user: req.userId,
            status: { $in: ['completed', 'skipped', 'carried_forward'] }
        }).sort({ updatedAt: -1 }).limit(50);
        return sendSuccess(res, { tasks }, 'Task history fetched');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

module.exports = {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
    markTaskDone,
    carryForwardTask,
    skipTask,
    getTaskHistory
};
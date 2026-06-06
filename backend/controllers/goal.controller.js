// controllers/goal.controller.js
// Handles goals and milestones

const Goal = require('../models/Goal');
const { sendSuccess, sendError } = require('../utils/response');

// ─── CREATE GOAL ──────────────────────────────
// POST /api/goals
const createGoal = async (req, res) => {
    try {
        const {
            title,
            description,
            duration,
            startDate,
            targetDate,
            category,
            phases
        } = req.body;
        if (!title) {
            return sendError(res, 'Goal title is required', 400);
        }
        const goal = await Goal.create({
            user: req.userId,
            title,
            description,
            duration,
            startDate,
            targetDate,
            category,
            phases: phases || [],
            aiGenerated: phases ? true : false
        });
        return sendSuccess(res, { goal }, 'Goal created', 201);
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── GET ALL GOALS ────────────────────────────
// GET /api/goals
const getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({
            user: req.userId
        }).sort({ createdAt: -1 });
        return sendSuccess(res, { goals }, 'Goals fetched');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── GET SINGLE GOAL ──────────────────────────
// GET /api/goals/:id
const getGoal = async (req, res) => {
    try {
        const goal = await Goal.findOne({
            _id: req.params.id,
            user: req.userId
        });
        if (!goal) {
            return sendError(res, 'Goal not found', 404);
        }
        return sendSuccess(res, { goal }, 'Goal fetched');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── UPDATE GOAL ──────────────────────────────
// PUT /api/goals/:id
const updateGoal = async (req, res) => {
    try {
        const goal = await Goal.findOneAndUpdate(
            { _id: req.params.id, user: req.userId },
            req.body,
            { new: true }
        );
        if (!goal) {
            return sendError(res, 'Goal not found', 404);
        }
        return sendSuccess(res, { goal }, 'Goal updated');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── DELETE GOAL ──────────────────────────────
// DELETE /api/goals/:id
const deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findOneAndDelete({
            _id: req.params.id,
            user: req.userId
        });
        if (!goal) {
            return sendError(res, 'Goal not found', 404);
        }
        return sendSuccess(res, {}, 'Goal deleted');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── COMPLETE MILESTONE ───────────────────────
// PUT /api/goals/:id/milestone/:milestoneId
const completeMilestone = async (req, res) => {
    try {
        const goal = await Goal.findOne({
            _id: req.params.id,
            user: req.userId
        });
        if (!goal) {
            return sendError(res, 'Goal not found', 404);
        }

    // Find and update milestone inside phases
        let milestoneFound = false;
        goal.phases.forEach(phase => {
            phase.milestones.forEach(milestone => {
                if (milestone._id.toString() === req.params.milestoneId) {
                    milestone.completed = true;
                    milestone.completedAt = new Date();
                    milestoneFound = true;
                }
            });
        });
        if (!milestoneFound) {
            return sendError(res, 'Milestone not found', 404);
        }

    // Recalculate progress
        let totalMilestones = 0;
        let completedMilestones = 0;

        goal.phases.forEach(phase => {
            phase.milestones.forEach(milestone => {
                totalMilestones++;
                if (milestone.completed) completedMilestones++;
            });
        });
        goal.progress = totalMilestones > 0
        ? Math.round((completedMilestones / totalMilestones) * 100)
        : 0;
        await goal.save();
        return sendSuccess(res, { goal }, 'Milestone completed');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

module.exports = {
    createGoal,
    getGoals,
    getGoal,
    updateGoal,
    deleteGoal,
    completeMilestone
};
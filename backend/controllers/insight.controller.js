// controllers/insight.controller.js
// Handles productivity analytics and insights

const Task = require('../models/Task');
const Journal = require('../models/Journal');
const FocusSession = require('../models/FocusSession');
const MockTest = require('../models/MockTest');
const { sendSuccess, sendError } = require('../utils/response');

// ─── GET DASHBOARD INSIGHTS ───────────────────
// GET /api/insights/dashboard
const getDashboardInsights = async (req, res) => {
    try {
        const today = new Date().toISOString().split('T')[0];

    // Get today's tasks
        const todayTasks = await Task.find({
            user: req.userId,
            scheduledDate: today
        });

    // Calculate task stats
        const totalTasks = todayTasks.length;
        const completedTasks = todayTasks.filter(t => t.status === 'completed').length;
        const pendingTasks = todayTasks.filter(t => t.status === 'pending').length;
        const skippedTasks = todayTasks.filter(t => t.status === 'skipped').length;
        const completionRate = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    // Get today's focus sessions
        const todayFocus = await FocusSession.find({
            user: req.userId,
            date: today,
            status: 'completed'
        });
        const totalFocusMinutes = todayFocus.reduce(
            (sum, s) => sum + (s.actualDuration || 0), 0
        );

    // Get today's journal
        const todayJournal = await Journal.findOne({
            user: req.userId,
            date: today
        });

    // Calculate productivity score
        const productivityScore = calculateScore(
            completionRate,
            totalFocusMinutes,
            todayJournal ? true : false
        );
        return sendSuccess(res, {
            today: {
                totalTasks,
                completedTasks,
                pendingTasks,
                skippedTasks,
                completionRate,
                totalFocusMinutes,
                hasJournal: todayJournal ? true : false,
                productivityScore
            }
        }, 'Dashboard insights fetched');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── GET WEEKLY INSIGHTS ──────────────────────
// GET /api/insights/weekly
const getWeeklyInsights = async (req, res) => {
    try {
    // Get last 7 days
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date.toISOString().split('T')[0]);
        }

    // Get tasks for last 7 days
        const tasks = await Task.find({
            user: req.userId,
            scheduledDate: { $in: days }
        });

    // Get focus sessions for last 7 days
        const focusSessions = await FocusSession.find({
            user: req.userId,
            date: { $in: days },
            status: 'completed'
        });

    // Build daily stats
        const dailyStats = days.map(date => {
            const dayTasks = tasks.filter(t => t.scheduledDate === date);
            const dayFocus = focusSessions.filter(s => s.date === date);
            const total = dayTasks.length;
            const completed = dayTasks.filter(t => t.status === 'completed').length;
            const focusMinutes = dayFocus.reduce(
                (sum, s) => sum + (s.actualDuration || 0), 0
            );
            return {
                date,
                total,
                completed,
                completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
                focusMinutes
            };
        });
        return sendSuccess(res, { dailyStats }, 'Weekly insights fetched');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── GET PRODUCTIVITY TRENDS ──────────────────
// GET /api/insights/trends
const getProductivityTrends = async (req, res) => {
    try {
    // Total tasks completed ever
        const totalCompleted = await Task.countDocuments({
            user: req.userId,
            status: 'completed'
        });

    // Total focus time ever
        const allSessions = await FocusSession.find({
            user: req.userId,
            status: 'completed'
        });
        const totalFocusHours = Math.round(
            allSessions.reduce((sum, s) => sum + (s.actualDuration || 0), 0) / 60
        );

    // Most productive category
        const categoryStats = await Task.aggregate([
            {
                $match: {
                    user: req.userId,
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);
        const topCategory = categoryStats.length > 0
        ? categoryStats[0]._id
        : 'study';

    // Mock test performance
        const mockTests = await MockTest.find({
            user: req.userId,
            status: 'completed'
        });
        const avgScore = mockTests.length > 0
        ? Math.round(
            mockTests.reduce((sum, t) => sum + t.percentage, 0) / mockTests.length
        )
        : 0;
        return sendSuccess(res, {
            trends: {
                totalCompleted,
                totalFocusHours,
                topCategory,
                avgMockScore: avgScore,
                totalMockTests: mockTests.length
            }
        }, 'Trends fetched');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── GET HABIT DRIFT ──────────────────────────
// GET /api/insights/habit-drift
const getHabitDrift = async (req, res) => {
    try {
        const last7Days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            last7Days.push(date.toISOString().split('T')[0]);
        }
        const journals = await Journal.find({
            user: req.userId,
            date: { $in: last7Days }
        });
        const journalDates = journals.map(j => j.date);
        const missedDays = last7Days.filter(d => !journalDates.includes(d));
        const tasks = await Task.find({
            user: req.userId,
            scheduledDate: { $in: last7Days }
        });
        const skippedTasks = tasks.filter(t => t.status === 'skipped').length;
        const totalTasks = tasks.length;
        const skipRate = totalTasks > 0
        ? Math.round((skippedTasks / totalTasks) * 100)
        : 0;
        return sendSuccess(res, {
            habitDrift: {
                missedJournalDays: missedDays.length,
                missedDays,
                skipRate,
                skippedTasks,
                totalTasks,
                driftLevel: missedDays.length > 3 || skipRate > 50
                ? 'high'
                : missedDays.length > 1 || skipRate > 25
                ? 'medium'
                : 'low'
            }
        }, 'Habit drift fetched');
    } catch (error) {
        return sendError(res, error.message, 500);
    }
};

// ─── HELPER: Calculate Productivity Score ─────
const calculateScore = (completionRate, focusMinutes, hasJournal) => {
    let score = 0;
    score += completionRate * 0.5;        // 50% weight on task completion
    score += Math.min(focusMinutes, 120) * 0.3; // 30% weight on focus time
    score += hasJournal ? 20 : 0;         // 20% weight on journal entry
    return Math.round(score);
};

module.exports = {
    getDashboardInsights,
    getWeeklyInsights,
    getProductivityTrends,
    getHabitDrift
};
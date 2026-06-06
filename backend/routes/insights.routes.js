// routes/insights.routes.js
// All insights endpoints — all protected

const router = require('express').Router();
const {
    getDashboardInsights,
    getWeeklyInsights,
    getProductivityTrends,
    getHabitDrift
} = require('../controllers/insight.controller');
const { protect } = require('../middleware/auth');

// All routes need login
router.use(protect);

router.get('/dashboard', getDashboardInsights); // GET /api/insights/dashboard
router.get('/weekly', getWeeklyInsights);       // GET /api/insights/weekly
router.get('/trends', getProductivityTrends);   // GET /api/insights/trends
router.get('/habit-drift', getHabitDrift);      // GET /api/insights/habit-drift

module.exports = router;
// routes/ai.routes.js
// All AI endpoints — all protected

const router = require('express').Router();
const {
    extractTasksFromJournal,
    generateGoalRoadmap,
    chat,
    generateMockTest,
    extractKeyPoints,
    solveDoubt
} = require('../controllers/ai.controller');
const { protect } = require('../middleware/auth');

// All routes need login
router.use(protect);

router.post('/extract-tasks', extractTasksFromJournal); // POST /api/ai/extract-tasks
router.post('/goal-roadmap', generateGoalRoadmap);      // POST /api/ai/goal-roadmap
router.post('/chat', chat);                             // POST /api/ai/chat
router.post('/mock-test', generateMockTest);            // POST /api/ai/mock-test
router.post('/key-points', extractKeyPoints);           // POST /api/ai/key-points
router.post('/solve-doubt', solveDoubt);                // POST /api/ai/solve-doubt

module.exports = router;
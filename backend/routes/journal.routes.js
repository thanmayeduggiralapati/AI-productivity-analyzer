// routes/journal.routes.js
// All journal endpoints — all protected

const router = require('express').Router();
const {
    createJournal,
    getTodayJournal,
    getJournalHistory,
    getJournalByDate,
    saveExtractedTasks,
    getStreak
} = require('../controllers/journal.controller');
const { protect } = require('../middleware/auth');

// All routes need login
router.use(protect);

router.post('/', createJournal);              // POST /api/journal
router.get('/today', getTodayJournal);        // GET  /api/journal/today
router.get('/history', getJournalHistory);    // GET  /api/journal/history
router.get('/streak', getStreak);             // GET  /api/journal/streak
router.post('/save-tasks', saveExtractedTasks); // POST /api/journal/save-tasks
router.get('/:date', getJournalByDate);       // GET  /api/journal/:date

module.exports = router;
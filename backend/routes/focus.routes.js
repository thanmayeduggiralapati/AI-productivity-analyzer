// routes/focus.routes.js
// All focus session endpoints — all protected

const router = require('express').Router();
const {
    startSession,
    updateTimerState,
    completeSession,
    abandonSession,
    getActiveSession,
    getSessionHistory,
    addDoubt
} = require('../controllers/focus.controller');
const { protect } = require('../middleware/auth');

// All routes need login
router.use(protect);

router.post('/start', startSession);           // POST /api/focus/start
router.get('/active', getActiveSession);       // GET  /api/focus/active
router.get('/history', getSessionHistory);     // GET  /api/focus/history
router.put('/:id/timer', updateTimerState);    // PUT  /api/focus/:id/timer
router.put('/:id/complete', completeSession);  // PUT  /api/focus/:id/complete
router.put('/:id/abandon', abandonSession);    // PUT  /api/focus/:id/abandon
router.post('/:id/doubt', addDoubt);           // POST /api/focus/:id/doubt

module.exports = router;
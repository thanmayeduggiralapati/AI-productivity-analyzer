// routes/travel.routes.js
// All travel endpoints — all protected

const router = require('express').Router();
const {
    getTravelTasks,
    calculateDepartureTime,
    extractTravelFromJournal
} = require('../controllers/travel.controller');
const { protect } = require('../middleware/auth');

// All routes need login
router.use(protect);

router.get('/', getTravelTasks);                    // GET  /api/travel
router.post('/departure', calculateDepartureTime);  // POST /api/travel/departure
router.post('/extract', extractTravelFromJournal);  // POST /api/travel/extract

module.exports = router;
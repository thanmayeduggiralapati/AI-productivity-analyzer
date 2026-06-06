// routes/goal.routes.js
// All goal endpoints — all protected

const router = require('express').Router();
const {
    createGoal,
    getGoals,
    getGoal,
    updateGoal,
    deleteGoal,
    completeMilestone
} = require('../controllers/goal.controller');
const { protect } = require('../middleware/auth');

// All routes need login
router.use(protect);

router.post('/', createGoal);                           // POST /api/goals
router.get('/', getGoals);                              // GET  /api/goals
router.get('/:id', getGoal);                            // GET  /api/goals/:id
router.put('/:id', updateGoal);                         // PUT  /api/goals/:id
router.delete('/:id', deleteGoal);                      // DELETE /api/goals/:id
router.put('/:id/milestone/:milestoneId', completeMilestone); // PUT /api/goals/:id/milestone/:milestoneId

module.exports = router;
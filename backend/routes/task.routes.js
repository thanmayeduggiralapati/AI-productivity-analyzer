// routes/task.routes.js
// All task endpoints — all protected (need login)

const router = require('express').Router();
const {
    createTask,
    getTasks,
    getTask,
    updateTask,
    deleteTask,
    markTaskDone,
    carryForwardTask,
    skipTask,
    getTaskHistory
} = require('../controllers/task.controller');
const { protect } = require('../middleware/auth');

// All routes need login
router.use(protect);

router.get('/history', getTaskHistory);   // GET /api/tasks/history
router.post('/', createTask);             // POST /api/tasks
router.get('/', getTasks);                // GET /api/tasks
router.get('/:id', getTask);              // GET /api/tasks/:id
router.put('/:id', updateTask);           // PUT /api/tasks/:id
router.delete('/:id', deleteTask);        // DELETE /api/tasks/:id
router.put('/:id/done', markTaskDone);    // PUT /api/tasks/:id/done
router.put('/:id/carry', carryForwardTask); // PUT /api/tasks/:id/carry
router.put('/:id/skip', skipTask);        // PUT /api/tasks/:id/skip

module.exports = router;
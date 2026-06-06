// routes/mocktest.routes.js
// All mock test endpoints — all protected

const router = require('express').Router();
const {
    createMockTest,
    getMockTests,
    getMockTest,
    submitMockTest,
    getMistakes,
    deleteMockTest
} = require('../controllers/mocktest.controller');
const { protect } = require('../middleware/auth');

// All routes need login
router.use(protect);

router.post('/', createMockTest);              // POST   /api/mocktests
router.get('/', getMockTests);                 // GET    /api/mocktests
router.get('/mistakes', getMistakes);          // GET    /api/mocktests/mistakes
router.get('/:id', getMockTest);               // GET    /api/mocktests/:id
router.put('/:id/submit', submitMockTest);     // PUT    /api/mocktests/:id/submit
router.delete('/:id', deleteMockTest);         // DELETE /api/mocktests/:id

module.exports = router;
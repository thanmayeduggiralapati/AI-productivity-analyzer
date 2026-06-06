// routes/note.routes.js
// All notes endpoints — all protected

const router = require('express').Router();
const {
    createNote,
    getNotes,
    getNote,
    updateNote,
    deleteNote,
    saveKeyPoints,
    togglePin
} = require('../controllers/note.controller');
const { protect } = require('../middleware/auth');

// All routes need login
router.use(protect);

router.post('/', createNote);                    // POST   /api/notes
router.get('/', getNotes);                       // GET    /api/notes
router.get('/:id', getNote);                     // GET    /api/notes/:id
router.put('/:id', updateNote);                  // PUT    /api/notes/:id
router.delete('/:id', deleteNote);               // DELETE /api/notes/:id
router.put('/:id/keypoints', saveKeyPoints);     // PUT    /api/notes/:id/keypoints
router.put('/:id/pin', togglePin);               // PUT    /api/notes/:id/pin

module.exports = router;
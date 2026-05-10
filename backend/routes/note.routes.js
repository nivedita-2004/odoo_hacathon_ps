const express = require('express');
const router = express.Router();
const noteController = require('../controllers/note.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateNote, validatePagination } = require('../middleware/validation.middleware');

router.get('/:tripId', authenticate, validatePagination, noteController.getNotes);

router.post('/:tripId', authenticate, validateNote, noteController.createNote);

router.get('/:tripId/recent', authenticate, noteController.getRecentNotes);

router.get('/:tripId/search', authenticate, validatePagination, noteController.searchNotes);

router.put('/:tripId/:noteId', authenticate, validateNote, noteController.updateNote);

router.delete('/:tripId/:noteId', authenticate, noteController.deleteNote);

module.exports = router;

const noteQueries = require('../queries/note.queries');
const tripQueries = require('../queries/trip.queries');
const { asyncHandler } = require('../middleware/error.middleware');

const getNotes = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;
  const { page = 1, limit = 20 } = req.query;

  const trip = await tripQueries.findById(parseInt(tripId));
  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  if (trip.user_id !== userId && trip.visibility !== 'public') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const result = await noteQueries.findByTripId(
    parseInt(tripId),
    parseInt(page),
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

const createNote = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;
  const { note } = req.body;

  const trip = await tripQueries.findById(parseInt(tripId));
  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  if (trip.user_id !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const noteId = await noteQueries.create({
    trip_id: parseInt(tripId),
    note,
    created_by: userId
  });

  const newNote = await noteQueries.findById(noteId);

  res.status(201).json({
    success: true,
    message: 'Note created successfully',
    data: { note: newNote }
  });
});

const updateNote = asyncHandler(async (req, res) => {
  const { tripId, noteId } = req.params;
  const userId = req.user.id;
  const { note } = req.body;

  const trip = await tripQueries.findById(parseInt(tripId));
  if (!trip || trip.user_id !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const existingNote = await noteQueries.findById(parseInt(noteId));
  if (!existingNote) {
    return res.status(404).json({
      success: false,
      message: 'Note not found'
    });
  }

  if (existingNote.created_by !== userId) {
    return res.status(403).json({
      success: false,
      message: 'You can only edit your own notes'
    });
  }

  await noteQueries.update(parseInt(noteId), note, userId);
  const updatedNote = await noteQueries.findById(parseInt(noteId));

  res.status(200).json({
    success: true,
    message: 'Note updated successfully',
    data: { note: updatedNote }
  });
});

const deleteNote = asyncHandler(async (req, res) => {
  const { tripId, noteId } = req.params;
  const userId = req.user.id;

  const trip = await tripQueries.findById(parseInt(tripId));
  if (!trip || trip.user_id !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const deleted = await noteQueries.delete(parseInt(noteId), userId);

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: 'Note not found or you do not have permission to delete it'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Note deleted successfully'
  });
});

const searchNotes = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;
  const { q, page = 1, limit = 20 } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  const trip = await tripQueries.findById(parseInt(tripId));
  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  if (trip.user_id !== userId && trip.visibility !== 'public') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const result = await noteQueries.searchNotes(
    parseInt(tripId),
    q,
    parseInt(page),
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

const getRecentNotes = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;
  const { limit = 5 } = req.query;

  const trip = await tripQueries.findById(parseInt(tripId));
  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  if (trip.user_id !== userId && trip.visibility !== 'public') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const notes = await noteQueries.getRecentNotes(parseInt(tripId), parseInt(limit));

  res.status(200).json({
    success: true,
    data: { notes }
  });
});

module.exports = {
  getNotes,
  createNote,
  updateNote,
  deleteNote,
  searchNotes,
  getRecentNotes
};

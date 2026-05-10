const tripQueries = require('../queries/trip.queries');
const tripStopQueries = require('../queries/tripStop.queries');
const budgetQueries = require('../queries/budget.queries');
const packingQueries = require('../queries/packing.queries');
const noteQueries = require('../queries/note.queries');
const { asyncHandler } = require('../middleware/error.middleware');

const getAllTrips = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, visibility } = req.query;
  const userId = req.user.id;

  const result = await tripQueries.findByUserId(
    userId,
    visibility,
    parseInt(page),
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

const getPublicTrips = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const result = await tripQueries.findPublicTrips(
    parseInt(page),
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

const getTripById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const trip = await tripQueries.findById(parseInt(id));

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  if (trip.user_id !== req.user.id && trip.visibility !== 'public') {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  res.status(200).json({
    success: true,
    data: { trip }
  });
});

const getTripBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;
  const trip = await tripQueries.findBySlug(slug);

  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  if (trip.visibility !== 'public' && trip.user_id !== req.user?.id) {
    return res.status(403).json({
      success: false,
      message: 'This trip is private'
    });
  }

  res.status(200).json({
    success: true,
    data: { trip }
  });
});

const createTrip = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { title, start_date, end_date, visibility, total_budget } = req.body;

  const slug = tripQueries.generateSlug(title);

  const tripId = await tripQueries.create({
    user_id: userId,
    title,
    slug,
    start_date,
    end_date,
    visibility: visibility || 'private',
    total_budget: total_budget || 0
  });

  const defaultPackingItems = await packingQueries.getDefaultPackingList();
  await packingQueries.createMultiple(tripId, defaultPackingItems);

  const trip = await tripQueries.findById(tripId);

  res.status(201).json({
    success: true,
    message: 'Trip created successfully',
    data: { trip }
  });
});

const updateTrip = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const tripId = parseInt(id);

  const trip = await tripQueries.findById(tripId);
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

  const allowedFields = ['title', 'start_date', 'end_date', 'visibility', 'total_budget'];
  const updateData = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  if (updateData.title && updateData.title !== trip.title) {
    updateData.slug = tripQueries.generateSlug(updateData.title);
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid fields to update'
    });
  }

  await tripQueries.update(tripId, updateData);
  const updatedTrip = await tripQueries.findById(tripId);

  res.status(200).json({
    success: true,
    message: 'Trip updated successfully',
    data: { trip: updatedTrip }
  });
});

const deleteTrip = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const tripId = parseInt(id);

  const trip = await tripQueries.findById(tripId);
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

  await tripQueries.delete(tripId);

  res.status(200).json({
    success: true,
    message: 'Trip deleted successfully'
  });
});

const getFullItinerary = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const tripId = parseInt(id);

  const trip = await tripQueries.findById(tripId);
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

  const itinerary = await tripQueries.getFullItinerary(tripId);

  const stops = {};
  for (const row of itinerary) {
    if (!stops[row.stop_id]) {
      stops[row.stop_id] = {
        id: row.stop_id,
        city: {
          id: row.city_id,
          name: row.city_name,
          country: row.country_name,
          latitude: row.latitude,
          longitude: row.longitude
        },
        arrival_date: row.arrival_date,
        departure_date: row.departure_date,
        stop_order: row.stop_order,
        activities: []
      };
    }

    if (row.activity_id) {
      stops[row.stop_id].activities.push({
        id: row.activity_id,
        title: row.activity_title,
        estimated_cost: row.estimated_cost,
        duration_minutes: row.duration_minutes,
        activity_date: row.activity_date
      });
    }
  }

  res.status(200).json({
    success: true,
    data: {
      trip: {
        id: trip.id,
        title: trip.title,
        start_date: trip.start_date,
        end_date: trip.end_date,
        total_budget: trip.total_budget
      },
      stops: Object.values(stops)
    }
  });
});

const cloneTrip = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const tripId = parseInt(id);

  const trip = await tripQueries.findById(tripId);
  if (!trip) {
    return res.status(404).json({
      success: false,
      message: 'Trip not found'
    });
  }

  if (trip.visibility !== 'public' && trip.user_id !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const newTripId = await tripQueries.cloneTrip(tripId, userId);
  const newTrip = await tripQueries.findById(newTripId);

  res.status(201).json({
    success: true,
    message: 'Trip cloned successfully',
    data: { trip: newTrip }
  });
});

module.exports = {
  getAllTrips,
  getPublicTrips,
  getTripById,
  getTripBySlug,
  createTrip,
  updateTrip,
  deleteTrip,
  getFullItinerary,
  cloneTrip
};

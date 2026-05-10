const tripQueries = require('../queries/trip.queries');
const tripStopQueries = require('../queries/tripStop.queries');
const { asyncHandler } = require('../middleware/error.middleware');

const getTripStops = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;

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

  const stops = await tripStopQueries.findByTripId(parseInt(tripId));

  res.status(200).json({
    success: true,
    data: { stops }
  });
});

const createStop = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;
  const { city_id, arrival_date, departure_date } = req.body;

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

  const nextOrder = await tripStopQueries.getNextStopOrder(parseInt(tripId));

  const stopId = await tripStopQueries.create({
    trip_id: parseInt(tripId),
    city_id: parseInt(city_id),
    arrival_date,
    departure_date,
    stop_order: nextOrder
  });

  const stop = await tripStopQueries.findById(stopId);

  res.status(201).json({
    success: true,
    message: 'Stop added successfully',
    data: { stop }
  });
});

const updateStop = asyncHandler(async (req, res) => {
  const { tripId, stopId } = req.params;
  const userId = req.user.id;

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

  const stop = await tripStopQueries.findById(parseInt(stopId));
  if (!stop || stop.trip_id !== parseInt(tripId)) {
    return res.status(404).json({
      success: false,
      message: 'Stop not found'
    });
  }

  const allowedFields = ['city_id', 'arrival_date', 'departure_date', 'stop_order'];
  const updateData = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = field === 'city_id' ? parseInt(req.body[field]) : req.body[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid fields to update'
    });
  }

  await tripStopQueries.update(parseInt(stopId), updateData);
  const updatedStop = await tripStopQueries.findById(parseInt(stopId));

  res.status(200).json({
    success: true,
    message: 'Stop updated successfully',
    data: { stop: updatedStop }
  });
});

const deleteStop = asyncHandler(async (req, res) => {
  const { tripId, stopId } = req.params;
  const userId = req.user.id;

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

  const stop = await tripStopQueries.findById(parseInt(stopId));
  if (!stop || stop.trip_id !== parseInt(tripId)) {
    return res.status(404).json({
      success: false,
      message: 'Stop not found'
    });
  }

  await tripStopQueries.delete(parseInt(stopId));

  res.status(200).json({
    success: true,
    message: 'Stop deleted successfully'
  });
});

const reorderStops = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;
  const { stop_orders } = req.body;

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

  if (!Array.isArray(stop_orders)) {
    return res.status(400).json({
      success: false,
      message: 'stop_orders must be an array'
    });
  }

  await tripStopQueries.reorderStops(parseInt(tripId), stop_orders);
  const stops = await tripStopQueries.findByTripId(parseInt(tripId));

  res.status(200).json({
    success: true,
    message: 'Stops reordered successfully',
    data: { stops }
  });
});

const addActivityToStop = asyncHandler(async (req, res) => {
  const { tripId, stopId } = req.params;
  const userId = req.user.id;
  const { activity_id, activity_date } = req.body;

  const trip = await tripQueries.findById(parseInt(tripId));
  if (!trip || trip.user_id !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const stop = await tripStopQueries.findById(parseInt(stopId));
  if (!stop || stop.trip_id !== parseInt(tripId)) {
    return res.status(404).json({
      success: false,
      message: 'Stop not found'
    });
  }

  const stopActivityId = await tripStopQueries.addActivityToStop(
    parseInt(stopId),
    parseInt(activity_id),
    activity_date || null
  );

  res.status(201).json({
    success: true,
    message: 'Activity added to stop successfully',
    data: { stop_activity_id: stopActivityId }
  });
});

const removeActivityFromStop = asyncHandler(async (req, res) => {
  const { tripId, stopId, stopActivityId } = req.params;
  const userId = req.user.id;

  const trip = await tripQueries.findById(parseInt(tripId));
  if (!trip || trip.user_id !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const removed = await tripStopQueries.removeActivityFromStop(parseInt(stopActivityId));

  if (!removed) {
    return res.status(404).json({
      success: false,
      message: 'Activity not found'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Activity removed from stop successfully'
  });
});

const getStopActivities = asyncHandler(async (req, res) => {
  const { tripId, stopId } = req.params;
  const userId = req.user.id;

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

  const stop = await tripStopQueries.findById(parseInt(stopId));
  if (!stop || stop.trip_id !== parseInt(tripId)) {
    return res.status(404).json({
      success: false,
      message: 'Stop not found'
    });
  }

  const activities = await tripStopQueries.getStopActivities(parseInt(stopId));

  res.status(200).json({
    success: true,
    data: { activities }
  });
});

module.exports = {
  getTripStops,
  createStop,
  updateStop,
  deleteStop,
  reorderStops,
  addActivityToStop,
  removeActivityFromStop,
  getStopActivities
};

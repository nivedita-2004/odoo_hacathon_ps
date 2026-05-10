const packingQueries = require('../queries/packing.queries');
const tripQueries = require('../queries/trip.queries');
const { asyncHandler } = require('../middleware/error.middleware');

const getPackingList = asyncHandler(async (req, res) => {
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

  const items = await packingQueries.findByTripId(parseInt(tripId));
  const stats = await packingQueries.getPackingStats(parseInt(tripId));

  res.status(200).json({
    success: true,
    data: { items, stats }
  });
});

const addPackingItem = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;
  const { item_name } = req.body;

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

  const itemId = await packingQueries.create({
    trip_id: parseInt(tripId),
    item_name,
    is_packed: false
  });

  const item = await packingQueries.findById(itemId);

  res.status(201).json({
    success: true,
    message: 'Item added to packing list',
    data: { item }
  });
});

const updatePackingItem = asyncHandler(async (req, res) => {
  const { tripId, itemId } = req.params;
  const userId = req.user.id;
  const { item_name, is_packed } = req.body;

  const trip = await tripQueries.findById(parseInt(tripId));
  if (!trip || trip.user_id !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  const updateData = {};
  if (item_name !== undefined) updateData.item_name = item_name;
  if (is_packed !== undefined) updateData.is_packed = is_packed;

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid fields to update'
    });
  }

  await packingQueries.update(parseInt(itemId), updateData);
  const item = await packingQueries.findById(parseInt(itemId));

  res.status(200).json({
    success: true,
    message: 'Item updated successfully',
    data: { item }
  });
});

const togglePackedStatus = asyncHandler(async (req, res) => {
  const { tripId, itemId } = req.params;
  const userId = req.user.id;

  const trip = await tripQueries.findById(parseInt(tripId));
  if (!trip || trip.user_id !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  await packingQueries.togglePacked(parseInt(itemId));
  const item = await packingQueries.findById(parseInt(itemId));

  res.status(200).json({
    success: true,
    message: 'Item status toggled',
    data: { item }
  });
});

const deletePackingItem = asyncHandler(async (req, res) => {
  const { tripId, itemId } = req.params;
  const userId = req.user.id;

  const trip = await tripQueries.findById(parseInt(tripId));
  if (!trip || trip.user_id !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  await packingQueries.delete(parseInt(itemId));

  res.status(200).json({
    success: true,
    message: 'Item removed from packing list'
  });
});

const resetPackingList = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;

  const trip = await tripQueries.findById(parseInt(tripId));
  if (!trip || trip.user_id !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }

  await packingQueries.resetAllItems(parseInt(tripId));

  res.status(200).json({
    success: true,
    message: 'All items reset to unpacked'
  });
});

const getPackingStats = asyncHandler(async (req, res) => {
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

  const stats = await packingQueries.getPackingStats(parseInt(tripId));

  res.status(200).json({
    success: true,
    data: { stats }
  });
});

module.exports = {
  getPackingList,
  addPackingItem,
  updatePackingItem,
  togglePackedStatus,
  deletePackingItem,
  resetPackingList,
  getPackingStats
};

const activityQueries = require('../queries/activity.queries');
const cityQueries = require('../queries/city.queries');
const { asyncHandler } = require('../middleware/error.middleware');

const getAllActivities = asyncHandler(async (req, res) => {
  const { city_id, page = 1, limit = 20, min_cost, max_cost, min_duration, max_duration } = req.query;

  if (!city_id) {
    return res.status(400).json({
      success: false,
      message: 'City ID is required'
    });
  }

  const filters = {};
  if (min_cost !== undefined) filters.minCost = parseFloat(min_cost);
  if (max_cost !== undefined) filters.maxCost = parseFloat(max_cost);
  if (min_duration !== undefined) filters.minDuration = parseInt(min_duration);
  if (max_duration !== undefined) filters.maxDuration = parseInt(max_duration);

  const result = await activityQueries.findByCityId(
    parseInt(city_id),
    filters,
    parseInt(page),
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

const getActivityById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const activity = await activityQueries.findById(parseInt(id));

  if (!activity) {
    return res.status(404).json({
      success: false,
      message: 'Activity not found'
    });
  }

  res.status(200).json({
    success: true,
    data: { activity }
  });
});

const searchActivities = asyncHandler(async (req, res) => {
  const { q, city_id, page = 1, limit = 20, min_cost, max_cost } = req.query;

  if (!q) {
    return res.status(400).json({
      success: false,
      message: 'Search query is required'
    });
  }

  const filters = {};
  if (city_id) filters.cityId = parseInt(city_id);
  if (min_cost !== undefined) filters.minCost = parseFloat(min_cost);
  if (max_cost !== undefined) filters.maxCost = parseFloat(max_cost);

  const result = await activityQueries.searchActivities(
    q,
    filters,
    parseInt(page),
    parseInt(limit)
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

const createActivity = asyncHandler(async (req, res) => {
  const { city_id, title, estimated_cost, duration_minutes } = req.body;

  const city = await cityQueries.findById(parseInt(city_id));
  if (!city) {
    return res.status(404).json({
      success: false,
      message: 'City not found'
    });
  }

  const activityId = await activityQueries.create({
    city_id: parseInt(city_id),
    title,
    estimated_cost: estimated_cost ? parseFloat(estimated_cost) : 0,
    duration_minutes: duration_minutes ? parseInt(duration_minutes) : 60
  });

  const activity = await activityQueries.findById(activityId);

  res.status(201).json({
    success: true,
    message: 'Activity created successfully',
    data: { activity }
  });
});

const updateActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const allowedFields = ['title', 'estimated_cost', 'duration_minutes'];
  const updateData = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({
      success: false,
      message: 'No valid fields to update'
    });
  }

  await activityQueries.update(parseInt(id), updateData);
  const activity = await activityQueries.findById(parseInt(id));

  res.status(200).json({
    success: true,
    message: 'Activity updated successfully',
    data: { activity }
  });
});

const deleteActivity = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await activityQueries.delete(parseInt(id));

  res.status(200).json({
    success: true,
    message: 'Activity deleted successfully'
  });
});

const getCategories = asyncHandler(async (req, res) => {
  const categories = await activityQueries.getCategories();

  res.status(200).json({
    success: true,
    data: { categories }
  });
});

const getCostRange = asyncHandler(async (req, res) => {
  const { city_id } = req.query;

  const range = await activityQueries.getCostRange(
    city_id ? parseInt(city_id) : null
  );

  res.status(200).json({
    success: true,
    data: { cost_range: range }
  });
});

module.exports = {
  getAllActivities,
  getActivityById,
  searchActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  getCategories,
  getCostRange
};

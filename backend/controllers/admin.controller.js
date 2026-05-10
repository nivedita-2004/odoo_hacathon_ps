const adminQueries = require('../queries/admin.queries');
const userQueries = require('../queries/user.queries');
const { asyncHandler } = require('../middleware/error.middleware');

const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await adminQueries.getDashboardStats();

  res.status(200).json({
    success: true,
    data: { stats }
  });
});

const getUserGrowth = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  const growth = await adminQueries.getUserGrowthStats(parseInt(days));

  res.status(200).json({
    success: true,
    data: { growth }
  });
});

const getTripCreationStats = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;

  const stats = await adminQueries.getTripCreationStats(parseInt(days));

  res.status(200).json({
    success: true,
    data: { stats }
  });
});

const getPopularCities = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const cities = await adminQueries.getPopularCities(parseInt(limit));

  res.status(200).json({
    success: true,
    data: { cities }
  });
});

const getPopularActivities = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const activities = await adminQueries.getPopularActivities(parseInt(limit));

  res.status(200).json({
    success: true,
    data: { activities }
  });
});

const getUserEngagement = asyncHandler(async (req, res) => {
  const stats = await adminQueries.getUserEngagementStats();

  res.status(200).json({
    success: true,
    data: { stats }
  });
});

const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  const result = await adminQueries.getAllUsersWithPagination(
    parseInt(page),
    parseInt(limit),
    status
  );

  res.status(200).json({
    success: true,
    data: result
  });
});

const updateUserStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  if (!['active', 'blocked', 'deleted'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid status. Must be active, blocked, or deleted'
    });
  }

  await adminQueries.updateUserStatus(parseInt(userId), status);

  res.status(200).json({
    success: true,
    message: 'User status updated successfully'
  });
});

const setAdminStatus = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { is_admin } = req.body;

  if (typeof is_admin !== 'boolean') {
    return res.status(400).json({
      success: false,
      message: 'is_admin must be a boolean'
    });
  }

  await adminQueries.setAdminStatus(parseInt(userId), is_admin);

  res.status(200).json({
    success: true,
    message: `User ${is_admin ? 'promoted to' : 'removed from'} admin`
  });
});

const getSystemHealth = asyncHandler(async (req, res) => {
  const health = await adminQueries.getSystemHealth();

  res.status(200).json({
    success: true,
    data: { health }
  });
});

module.exports = {
  getDashboardStats,
  getUserGrowth,
  getTripCreationStats,
  getPopularCities,
  getPopularActivities,
  getUserEngagement,
  getAllUsers,
  updateUserStatus,
  setAdminStatus,
  getSystemHealth
};

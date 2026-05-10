const budgetQueries = require('../queries/budget.queries');
const tripQueries = require('../queries/trip.queries');
const { asyncHandler } = require('../middleware/error.middleware');

const getBudget = asyncHandler(async (req, res) => {
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

  const budget = await budgetQueries.findByTripId(parseInt(tripId));

  res.status(200).json({
    success: true,
    data: { budget: budget || null }
  });
});

const createOrUpdateBudget = asyncHandler(async (req, res) => {
  const { tripId } = req.params;
  const userId = req.user.id;
  const { transport_budget, accommodation_budget, food_budget } = req.body;

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

  const result = await budgetQueries.createOrUpdate({
    trip_id: parseInt(tripId),
    transport_budget: transport_budget !== undefined ? parseFloat(transport_budget) : 0,
    accommodation_budget: accommodation_budget !== undefined ? parseFloat(accommodation_budget) : 0,
    food_budget: food_budget !== undefined ? parseFloat(food_budget) : 0
  });

  const budget = await budgetQueries.findByTripId(parseInt(tripId));

  res.status(200).json({
    success: true,
    message: result.updated ? 'Budget updated successfully' : 'Budget created successfully',
    data: { budget }
  });
});

const getBudgetBreakdown = asyncHandler(async (req, res) => {
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

  const breakdown = await budgetQueries.getTripBudgetBreakdown(parseInt(tripId));

  res.status(200).json({
    success: true,
    data: { breakdown }
  });
});

const getCostBreakdownByCategory = asyncHandler(async (req, res) => {
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

  const categories = await budgetQueries.getCostBreakdownByCategory(parseInt(tripId));

  res.status(200).json({
    success: true,
    data: { categories }
  });
});

const getDailyCostEstimate = asyncHandler(async (req, res) => {
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

  const dailyCost = await budgetQueries.getDailyCostEstimate(parseInt(tripId));

  res.status(200).json({
    success: true,
    data: { daily_cost: dailyCost }
  });
});

const checkBudgetStatus = asyncHandler(async (req, res) => {
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

  const status = await budgetQueries.checkBudgetStatus(parseInt(tripId));

  res.status(200).json({
    success: true,
    data: { budget_status: status }
  });
});

module.exports = {
  getBudget,
  createOrUpdateBudget,
  getBudgetBreakdown,
  getCostBreakdownByCategory,
  getDailyCostEstimate,
  checkBudgetStatus
};

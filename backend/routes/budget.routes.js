const express = require('express');
const router = express.Router();
const budgetController = require('../controllers/budget.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/:tripId', authenticate, budgetController.getBudget);

router.post('/:tripId', authenticate, budgetController.createOrUpdateBudget);

router.get('/:tripId/breakdown', authenticate, budgetController.getBudgetBreakdown);

router.get('/:tripId/categories', authenticate, budgetController.getCostBreakdownByCategory);

router.get('/:tripId/daily-cost', authenticate, budgetController.getDailyCostEstimate);

router.get('/:tripId/status', authenticate, budgetController.checkBudgetStatus);

module.exports = router;

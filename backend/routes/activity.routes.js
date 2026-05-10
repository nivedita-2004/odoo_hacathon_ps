const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activity.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const { validateActivity, validatePagination } = require('../middleware/validation.middleware');

router.get('/', validatePagination, activityController.getAllActivities);

router.get('/search', validatePagination, activityController.searchActivities);

router.get('/categories', activityController.getCategories);

router.get('/cost-range', activityController.getCostRange);

router.get('/:id', activityController.getActivityById);

router.post('/', authenticate, requireAdmin, validateActivity, activityController.createActivity);

router.put('/:id', authenticate, requireAdmin, validateActivity, activityController.updateActivity);

router.delete('/:id', authenticate, requireAdmin, activityController.deleteActivity);

module.exports = router;

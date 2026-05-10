const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const { validatePagination } = require('../middleware/validation.middleware');

router.use(authenticate, requireAdmin);

router.get('/dashboard', adminController.getDashboardStats);

router.get('/users', validatePagination, adminController.getAllUsers);

router.put('/users/:userId/status', adminController.updateUserStatus);

router.put('/users/:userId/admin', adminController.setAdminStatus);

router.get('/analytics/user-growth', adminController.getUserGrowth);

router.get('/analytics/trip-creation', adminController.getTripCreationStats);

router.get('/analytics/popular-cities', adminController.getPopularCities);

router.get('/analytics/popular-activities', adminController.getPopularActivities);

router.get('/analytics/engagement', adminController.getUserEngagement);

router.get('/health', adminController.getSystemHealth);

module.exports = router;

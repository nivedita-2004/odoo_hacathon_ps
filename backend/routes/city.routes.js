const express = require('express');
const router = express.Router();
const cityController = require('../controllers/city.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const { validatePagination } = require('../middleware/validation.middleware');

router.get('/', validatePagination, cityController.getAllCities);

router.get('/search', validatePagination, cityController.searchCities);

router.get('/popular', cityController.getPopularCities);

router.get('/countries', cityController.getCountries);

router.get('/:id', cityController.getCityById);

router.get('/:id/activities', validatePagination, cityController.getCityActivities);

router.post('/', authenticate, requireAdmin, cityController.createCity);

router.put('/:id', authenticate, requireAdmin, cityController.updateCity);

router.delete('/:id', authenticate, requireAdmin, cityController.deleteCity);

module.exports = router;

const express = require('express');
const router = express.Router();
const tripController = require('../controllers/trip.controller');
const tripStopController = require('../controllers/tripStop.controller');
const { authenticate, optionalAuth } = require('../middleware/auth.middleware');
const { validateTrip, validateTripStop, validatePagination, validateId } = require('../middleware/validation.middleware');

router.get('/public', validatePagination, tripController.getPublicTrips);

router.get('/', authenticate, validatePagination, tripController.getAllTrips);

router.post('/', authenticate, validateTrip, tripController.createTrip);

router.get('/slug/:slug', optionalAuth, tripController.getTripBySlug);

router.get('/:id', authenticate, validateId('id'), tripController.getTripById);

router.put('/:id', authenticate, validateId('id'), validateTrip, tripController.updateTrip);

router.delete('/:id', authenticate, validateId('id'), tripController.deleteTrip);

router.get('/:id/itinerary', authenticate, validateId('id'), tripController.getFullItinerary);

router.post('/:id/clone', authenticate, validateId('id'), tripController.cloneTrip);

router.get('/:tripId/stops', authenticate, tripStopController.getTripStops);

router.post('/:tripId/stops', authenticate, validateTripStop, tripStopController.createStop);

router.put('/:tripId/stops/reorder', authenticate, tripStopController.reorderStops);

router.get('/:tripId/stops/:stopId', authenticate, tripStopController.getStopActivities);

router.put('/:tripId/stops/:stopId', authenticate, validateTripStop, tripStopController.updateStop);

router.delete('/:tripId/stops/:stopId', authenticate, tripStopController.deleteStop);

router.post('/:tripId/stops/:stopId/activities', authenticate, tripStopController.addActivityToStop);

router.delete('/:tripId/stops/:stopId/activities/:stopActivityId', authenticate, tripStopController.removeActivityFromStop);

module.exports = router;

const express = require('express');
const router = express.Router();
const packingController = require('../controllers/packing.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validatePackingItem } = require('../middleware/validation.middleware');

router.get('/:tripId', authenticate, packingController.getPackingList);

router.post('/:tripId', authenticate, validatePackingItem, packingController.addPackingItem);

router.get('/:tripId/stats', authenticate, packingController.getPackingStats);

router.put('/:tripId/:itemId', authenticate, packingController.updatePackingItem);

router.patch('/:tripId/:itemId/toggle', authenticate, packingController.togglePackedStatus);

router.delete('/:tripId/:itemId', authenticate, packingController.deletePackingItem);

router.post('/:tripId/reset', authenticate, packingController.resetPackingList);

module.exports = router;

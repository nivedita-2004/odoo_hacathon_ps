const express = require('express');
const router = express.Router();
const multer = require('multer');
const userController = require('../controllers/user.controller');
const { authenticate, requireAdmin } = require('../middleware/auth.middleware');
const { validatePagination } = require('../middleware/validation.middleware');

const upload = multer({ storage: multer.memoryStorage() });

router.get('/dashboard', authenticate, userController.getDashboard);

router.get('/profile', authenticate, userController.getProfile);

router.get('/:id', authenticate, userController.getProfile);

router.put('/profile', authenticate, userController.updateProfile);

router.post('/profile/photo', authenticate, upload.single('photo'), userController.updateProfilePhoto);

router.delete('/account', authenticate, userController.deleteAccount);

router.get('/:id/trips', authenticate, validatePagination, userController.getUserTrips);

module.exports = router;

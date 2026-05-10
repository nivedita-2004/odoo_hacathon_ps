const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateRegister, validateLogin, handleValidationErrors } = require('../middleware/validation.middleware');
const { body } = require('express-validator');

const validateForgotPassword = [
  body('email').isEmail().withMessage('Valid email is required'),
  handleValidationErrors
];

const validateResetPassword = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('new_password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

router.post('/register', validateRegister, authController.register);

router.post('/login', validateLogin, authController.login);

router.get('/me', authenticate, authController.getMe);

router.post('/change-password', authenticate, authController.changePassword);

router.post('/forgot-password', validateForgotPassword, authController.forgotPassword);

router.post('/verify-otp', validateForgotPassword, authController.verifyOTP);

router.post('/reset-password', validateResetPassword, authController.resetPassword);

router.post('/refresh-token', authController.refreshAccessToken);

router.post('/logout', authenticate, authController.logout);

router.post('/logout-all', authenticate, authController.logoutAll);

module.exports = router;

const { validationResult, body, param, query } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

const validateRegister = [
  body('full_name')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 120 }).withMessage('Full name must be between 2 and 120 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  handleValidationErrors
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email format'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

const validateTrip = [
  body('title')
    .trim()
    .notEmpty().withMessage('Trip title is required')
    .isLength({ max: 200 }).withMessage('Title must not exceed 200 characters'),
  body('start_date')
    .optional()
    .isISO8601().withMessage('Invalid start date format'),
  body('end_date')
    .optional()
    .isISO8601().withMessage('Invalid end date format'),
  body('visibility')
    .optional()
    .isIn(['private', 'public', 'friends']).withMessage('Visibility must be private, public, or friends'),
  handleValidationErrors
];

const validateTripStop = [
  body('city_id')
    .notEmpty().withMessage('City ID is required')
    .isInt({ min: 1 }).withMessage('Invalid city ID'),
  body('arrival_date')
    .optional()
    .isISO8601().withMessage('Invalid arrival date format'),
  body('departure_date')
    .optional()
    .isISO8601().withMessage('Invalid departure date format'),
  handleValidationErrors
];

const validateActivity = [
  body('city_id')
    .notEmpty().withMessage('City ID is required')
    .isInt({ min: 1 }).withMessage('Invalid city ID'),
  body('title')
    .trim()
    .notEmpty().withMessage('Activity title is required')
    .isLength({ max: 255 }).withMessage('Title must not exceed 255 characters'),
  body('estimated_cost')
    .optional()
    .isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
  body('duration_minutes')
    .optional()
    .isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
  handleValidationErrors
];

const validatePackingItem = [
  body('item_name')
    .trim()
    .notEmpty().withMessage('Item name is required')
    .isLength({ max: 255 }).withMessage('Item name must not exceed 255 characters'),
  handleValidationErrors
];

const validateNote = [
  body('note')
    .trim()
    .notEmpty().withMessage('Note content is required'),
  handleValidationErrors
];

const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  handleValidationErrors
];

const validateId = (paramName = 'id') => [
  param(paramName)
    .notEmpty().withMessage(`${paramName} is required`)
    .isInt({ min: 1 }).withMessage(`Invalid ${paramName}`),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateTrip,
  validateTripStop,
  validateActivity,
  validatePackingItem,
  validateNote,
  validatePagination,
  validateId
};

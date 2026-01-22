const { body, param } = require('express-validator');

/**
 * Validation rules for creating a shipment
 */
const createShipmentValidation = [
  body('origin')
    .trim()
    .notEmpty()
    .withMessage('Origin is required')
    .isLength({ max: 255 })
    .withMessage('Origin must be less than 255 characters'),
  body('destination')
    .trim()
    .notEmpty()
    .withMessage('Destination is required')
    .isLength({ max: 255 })
    .withMessage('Destination must be less than 255 characters'),
  body('weight_kg')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  body('status')
    .optional()
    .isIn(['pending', 'in_transit', 'delivered', 'cancelled'])
    .withMessage('Status must be one of: pending, in_transit, delivered, cancelled'),
];

/**
 * Validation rules for updating a shipment
 */
const updateShipmentValidation = [
  body('origin')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Origin cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Origin must be less than 255 characters'),
  body('destination')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Destination cannot be empty')
    .isLength({ max: 255 })
    .withMessage('Destination must be less than 255 characters'),
  body('weight_kg')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Weight must be a positive number'),
  body('status')
    .optional()
    .isIn(['pending', 'in_transit', 'delivered', 'cancelled'])
    .withMessage('Status must be one of: pending, in_transit, delivered, cancelled'),
];

/**
 * Validation for UUID parameter
 */
const uuidParamValidation = [
  param('id')
    .isUUID()
    .withMessage('Invalid shipment ID format'),
];

module.exports = {
  createShipmentValidation,
  updateShipmentValidation,
  uuidParamValidation,
};

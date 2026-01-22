const express = require('express');
const router = express.Router();
const {
  createShipment,
  getShipments,
  getShipmentById,
  updateShipment,
  deleteShipment,
} = require('../controllers/shipmentController');
const {
  createShipmentValidation,
  updateShipmentValidation,
  uuidParamValidation,
} = require('../middleware/validators');

/**
 * @route   POST /api/v1/shipments
 * @desc    Create a new shipment
 * @access  Private (requires JWT via Gateway)
 */
router.post('/', createShipmentValidation, createShipment);

/**
 * @route   GET /api/v1/shipments
 * @desc    Get all shipments for authenticated user
 * @access  Private (requires JWT via Gateway)
 */
router.get('/', getShipments);

/**
 * @route   GET /api/v1/shipments/:id
 * @desc    Get a shipment by ID
 * @access  Private (requires JWT via Gateway)
 */
router.get('/:id', uuidParamValidation, getShipmentById);

/**
 * @route   PUT /api/v1/shipments/:id
 * @desc    Update a shipment
 * @access  Private (requires JWT via Gateway)
 */
router.put('/:id', uuidParamValidation, updateShipmentValidation, updateShipment);

/**
 * @route   DELETE /api/v1/shipments/:id
 * @desc    Delete a shipment
 * @access  Private (requires JWT via Gateway)
 */
router.delete('/:id', uuidParamValidation, deleteShipment);

module.exports = router;

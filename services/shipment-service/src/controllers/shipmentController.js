const { validationResult } = require('express-validator');
const pool = require('../config/database');

/**
 * Create a new shipment
 */
async function createShipment(req, res, next) {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { origin, destination, weight_kg, status } = req.body;
    console.log('req.user.id', req.user.userId);
    const userId = req.user.userId;

    // Insert shipment
    const result = await pool.query(
      `INSERT INTO shipments (user_id, origin, destination, weight_kg, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, user_id, origin, destination, status, weight_kg, created_at, updated_at`,
      [userId, origin, destination, weight_kg || null, status || 'pending']
    );

    const shipment = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Shipment created successfully',
      data: {
        shipment,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all shipments for the authenticated user
 */
async function getShipments(req, res, next) {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT id, user_id, origin, destination, status, weight_kg, created_at, updated_at
       FROM shipments
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({
      success: true,
      message: 'Shipments retrieved successfully',
      data: {
        shipments: result.rows,
        count: result.rows.length,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get a single shipment by ID (verify ownership)
 */
async function getShipmentById(req, res, next) {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      `SELECT id, user_id, origin, destination, status, weight_kg, created_at, updated_at
       FROM shipments
       WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found or you do not have access',
        error: 'SHIPMENT_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      message: 'Shipment retrieved successfully',
      data: {
        shipment: result.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update a shipment (verify ownership)
 */
async function updateShipment(req, res, next) {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const userId = req.user.userId;
    const { origin, destination, weight_kg, status } = req.body;

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (origin !== undefined) {
      updates.push(`origin = $${paramCount++}`);
      values.push(origin);
    }
    if (destination !== undefined) {
      updates.push(`destination = $${paramCount++}`);
      values.push(destination);
    }
    if (weight_kg !== undefined) {
      updates.push(`weight_kg = $${paramCount++}`);
      values.push(weight_kg);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update',
        error: 'NO_UPDATES',
      });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id, userId);

    const result = await pool.query(
      `UPDATE shipments
       SET ${updates.join(', ')}
       WHERE id = $${paramCount} AND user_id = $${paramCount + 1}
       RETURNING id, user_id, origin, destination, status, weight_kg, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found or you do not have access',
        error: 'SHIPMENT_NOT_FOUND',
      });
    }

    res.json({
      success: true,
      message: 'Shipment updated successfully',
      data: {
        shipment: result.rows[0],
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a shipment (verify ownership)
 */
async function deleteShipment(req, res, next) {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const userId = req.user.userId;

    const result = await pool.query(
      `DELETE FROM shipments
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Shipment not found or you do not have access',
        error: 'SHIPMENT_NOT_FOUND',
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createShipment,
  getShipments,
  getShipmentById,
  updateShipment,
  deleteShipment,
};

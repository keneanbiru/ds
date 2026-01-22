const express = require('express');
const router = express.Router();
const authenticateToken = require('../middleware/authMiddleware');
const createServiceProxy = require('../middleware/proxyMiddleware');
const services = require('../config/services');

console.log('[Routes] Gateway routes module loaded');
console.log('[Routes] Auth service URL:', services.auth.url);

// Debug: Log all requests to this router
router.use((req, res, next) => {
  console.log(`[Router] Request in gatewayRoutes: ${req.method} ${req.path} (originalUrl: ${req.originalUrl})`);
  next();
});

/**
 * Public routes (no authentication required)
 */
// Auth service routes - match all paths under /auth
// router.use('/auth', ...) will match /auth, /auth/register, /auth/login, etc.
console.log('[Routes] Registering /auth route');
router.use('/auth', (req, res, next) => {
  console.log(`[Route Match] ✅✅✅ AUTH ROUTE MATCHED! ${req.method} ${req.path}`);
  console.log(`[Route Match] originalUrl: ${req.originalUrl}, baseUrl: ${req.baseUrl}, url: ${req.url}`);
  next();
}, createServiceProxy('auth', services.auth.url));

/**
 * Protected routes (authentication required)
 */
// Shipment service routes - match all paths under /shipments
console.log('[Routes] Registering /shipments route');
router.use('/shipments', (req, res, next) => {
  console.log(`[Shipments Route] ✅✅✅ ROUTE MATCHED! ${req.method} ${req.path}`);
  console.log(`[Shipments Route] Before authenticateToken, req.user:`, req.user ? 'SET' : 'NOT SET');
  next();
}, authenticateToken, (req, res, next) => {
  console.log(`[Shipments Route] After authenticateToken, req.user:`, req.user ? `SET (userId: ${req.user.userId})` : 'NOT SET');
  next();
}, createServiceProxy('shipments', services.shipment.url));
  
// Warehouse service routes
router.use('/warehouse', authenticateToken, createServiceProxy('warehouse', services.warehouse.url));

// Tracking service routes
router.use('/tracking', authenticateToken, createServiceProxy('tracking', services.tracking.url));

module.exports = router;

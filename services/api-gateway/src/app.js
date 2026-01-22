const express = require('express');
const cors = require('cors');
require('dotenv').config();

const gatewayRoutes = require('./routes/gatewayRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());

// Body parsing - parse JSON for all routes
// http-proxy-middleware will handle forwarding the body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware - FIRST to catch all requests
app.use((req, res, next) => {
  console.log(`[Request] ${new Date().toISOString()} - ${req.method} ${req.path} (originalUrl: ${req.originalUrl})`);
  next();
});

// API routes
console.log('[App] Mounting gateway routes at /api/v1');
app.use('/api/v1', (req, res, next) => {
  console.log(`[App Router] ✅ Request reached /api/v1 router! Method: ${req.method}, Path: ${req.path}, OriginalUrl: ${req.originalUrl}`);
  next();
}, gatewayRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Gateway is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'DLMS API Gateway',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      shipments: '/api/v1/shipments (protected)',
      warehouse: '/api/v1/warehouse (protected)',
      tracking: '/api/v1/tracking (protected)',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    error: 'NOT_FOUND',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;

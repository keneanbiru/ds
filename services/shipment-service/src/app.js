const express = require('express');
const cors = require('cors');
require('dotenv').config();

const shipmentRoutes = require('./routes/shipmentRoutes');
const extractUserFromHeaders = require('./middleware/authMiddleware');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware with detailed debug info
app.use((req, res, next) => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log(`[DEBUG] Original URL: ${req.originalUrl || req.url}`);
  console.log(`[DEBUG] Headers:`);
  console.log(JSON.stringify(req.headers, null, 2));
  console.log(`[DEBUG] Body:`);
  console.log(JSON.stringify(req.body, null, 2));
  console.log(`[DEBUG] Query:`, req.query);
  console.log(`[DEBUG] Params:`, req.params);
  console.log(`${'='.repeat(80)}\n`);
  next();
});

// Extract user from headers (set by API Gateway)
app.use('/api/v1/shipments', extractUserFromHeaders);

// Routes
app.use('/api/v1/shipments', shipmentRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Shipment service is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Shipment Service API',
    version: '1.0.0',
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;

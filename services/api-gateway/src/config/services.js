require('dotenv').config();

/**
 * Service URLs configuration
 * Services are accessed by their Docker service names
 */
const services = {
  auth: {
    url: process.env.AUTH_SERVICE_URL || 'http://auth-service:3001',
    name: 'Auth Service',
  },
  shipment: {
    url: process.env.SHIPMENT_SERVICE_URL || 'http://shipment-service:3002',
    name: 'Shipment Service',
  },
  warehouse: {
    url: process.env.WAREHOUSE_SERVICE_URL || 'http://warehouse-service:3003',
    name: 'Warehouse Service',
  },
  tracking: {
    url: process.env.TRACKING_SERVICE_URL || 'http://tracking-service:3004',
    name: 'Tracking Service',
  },
};

module.exports = services;

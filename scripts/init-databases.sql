-- Initialize databases for DLMS microservices
-- This script runs automatically when PostgreSQL container starts for the first time

-- Create databases for each service
CREATE DATABASE auth_db;
CREATE DATABASE shipment_db;
CREATE DATABASE warehouse_db;
CREATE DATABASE tracking_db;

-- Grant privileges (using default postgres user)
GRANT ALL PRIVILEGES ON DATABASE auth_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE shipment_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE warehouse_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE tracking_db TO postgres;

-- Log completion
DO $$
BEGIN
    RAISE NOTICE 'DLMS databases initialized successfully';
END $$;

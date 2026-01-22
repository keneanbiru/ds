require('dotenv').config();
const app = require('./app');
const pool = require('./config/database');

const PORT = process.env.PORT || 3001;

// Initialize database connection
async function initializeDatabase() {
  try {
    // Test database connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connection established');

    // Run migration (create users table if it doesn't exist)
    const fs = require('fs');
    const path = require('path');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, '../migrations/001_create_users_table.sql'),
      'utf8'
    );
    await pool.query(migrationSQL);
    console.log('✅ Database schema initialized');
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    // Don't exit, let the service start and retry
  }
}

// Start server
async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();

    // Start HTTP server
    app.listen(PORT, () => {
      console.log(`🚀 Auth Service running on port ${PORT}`);
      console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

startServer();

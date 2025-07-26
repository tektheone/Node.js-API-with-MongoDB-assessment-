const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const userRoutes = require('./routes/userRoutes');

// Import database connection and initialization
const { connectToDatabase, checkConnection } = require('./config/database');
const { initializeDatabase } = require('./config/dbInit');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/users', userRoutes);

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbConnected = await checkConnection();
    
    if (dbConnected) {
      return res.status(200).json({
        status: 'ok',
        message: 'API is running',
        database: {
          connected: true,
          message: 'Database connection is healthy'
        },
        timestamp: new Date().toISOString()
      });
    } else {
      return res.status(503).json({
        status: 'degraded',
        message: 'API is running but database connection is not healthy',
        database: {
          connected: false,
          message: 'Database connection failed'
        },
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Health check failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// 404 handler for undefined routes
app.use((req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    error: true,
    message: err.message || 'Internal Server Error',
    path: req.path,
    timestamp: new Date().toISOString(),
  });
});

// Start the server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Initialize database collections and indexes
    await initializeDatabase();
    
    // Start listening for requests
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Health check available at http://localhost:${PORT}/health`);
      console.log(`API endpoint available at http://localhost:${PORT}/users/:id`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// For testing purposes
module.exports = app;

// Only start the server if this file is run directly (not imported in tests)
if (require.main === module) {
  startServer();
}

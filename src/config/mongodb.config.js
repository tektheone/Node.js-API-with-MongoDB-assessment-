/**
 * MongoDB configuration for different environments
 */
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Environment-specific MongoDB configurations
const mongoConfig = {
  development: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/centivo',
    options: {
      useUnifiedTopology: true,
      maxPoolSize: 10,
      minPoolSize: 1,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      retryReads: true
    }
  },
  test: {
    uri: process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/centivo_test',
    options: {
      useUnifiedTopology: true,
      maxPoolSize: 5,
      minPoolSize: 1,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 15000,
      serverSelectionTimeoutMS: 5000,
      retryWrites: true,
      retryReads: true
    }
  },
  production: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/centivo',
    options: {
      useUnifiedTopology: true,
      maxPoolSize: 20,
      minPoolSize: 5,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 60000,
      serverSelectionTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true
    }
  }
};

// Get current environment
const env = process.env.NODE_ENV || 'development';

// Export configuration for current environment
module.exports = mongoConfig[env];

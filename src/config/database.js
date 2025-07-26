const { MongoClient } = require('mongodb');

// MongoDB connection URL from environment variables
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/centivo';

// MongoDB client
let client;
let db;

/**
 * Connect to MongoDB and initialize the database connection
 */
async function connectToDatabase() {
  try {
    if (!client) {
      client = new MongoClient(uri);
      await client.connect();
      console.log('Connected to MongoDB successfully');
      
      // Get database name from connection string
      const dbName = uri.split('/').pop().split('?')[0];
      db = client.db(dbName);
    }
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

/**
 * Get the database instance
 * @returns {object} MongoDB database instance
 */
function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call connectToDatabase first.');
  }
  return db;
}

/**
 * Close the database connection
 */
async function closeDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('MongoDB connection closed');
  }
}

module.exports = {
  connectToDatabase,
  getDb,
  closeDatabase,
};

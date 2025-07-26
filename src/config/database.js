const { MongoClient } = require('mongodb');

// Import MongoDB configuration
const mongoConfig = require('./mongodb.config');
const { uri, options } = mongoConfig;

// MongoDB client
let client;
let db;
let isConnecting = false;
let connectionRetries = 0;
const MAX_RETRIES = 5;

/**
 * Connect to MongoDB and initialize the database connection
 * @returns {Promise<object>} MongoDB database instance
 */
async function connectToDatabase() {
  // If already connecting, wait for the connection to complete
  if (isConnecting) {
    console.log('Connection already in progress, waiting...');
    // Wait for connection to complete
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    if (db) return db;
  }
  
  try {
    isConnecting = true;
    
    if (!client) {
      console.log(`Connecting to MongoDB at ${uri.split('@').pop()}...`);
      client = new MongoClient(uri, options);
      
      await client.connect();
      
      // Reset connection retries on successful connection
      connectionRetries = 0;
      
      console.log('Connected to MongoDB successfully');
      
      // Get database name from connection string
      const dbName = uri.split('/').pop().split('?')[0];
      db = client.db(dbName);
      
      // Add event listeners for connection monitoring
      client.on('serverHeartbeatSucceeded', () => {
        // Connection is healthy
      });
      
      client.on('serverHeartbeatFailed', async (event) => {
        console.warn(`MongoDB heartbeat failed: ${event.failure}`);
        if (!client.topology.isConnected()) {
          console.error('MongoDB connection lost, attempting to reconnect...');
          await reconnectWithRetry();
        }
      });
      
      client.on('close', async () => {
        console.warn('MongoDB connection closed unexpectedly');
        await reconnectWithRetry();
      });
    }
    
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    await reconnectWithRetry();
    throw error;
  } finally {
    isConnecting = false;
  }
}

/**
 * Attempt to reconnect to MongoDB with exponential backoff
 * @returns {Promise<void>}
 */
async function reconnectWithRetry() {
  if (connectionRetries >= MAX_RETRIES) {
    console.error(`Failed to reconnect after ${MAX_RETRIES} attempts`);
    return;
  }
  
  // Close existing client if it exists
  if (client) {
    try {
      await client.close(true);
    } catch (err) {
      console.error('Error closing MongoDB client:', err);
    }
    client = null;
    db = null;
  }
  
  // Calculate backoff time with exponential increase
  const backoffTime = Math.min(1000 * (2 ** connectionRetries), 30000);
  connectionRetries++;
  
  console.log(`Reconnect attempt ${connectionRetries}/${MAX_RETRIES} in ${backoffTime}ms`);
  
  // Wait for backoff time
  await new Promise(resolve => setTimeout(resolve, backoffTime));
  
  // Attempt to reconnect
  try {
    isConnecting = true;
    client = new MongoClient(uri, options);
    await client.connect();
    
    // Get database name from connection string
    const dbName = uri.split('/').pop().split('?')[0];
    db = client.db(dbName);
    
    console.log('Successfully reconnected to MongoDB');
    connectionRetries = 0; // Reset retry counter on success
  } catch (error) {
    console.error(`Reconnection attempt ${connectionRetries} failed:`, error);
    await reconnectWithRetry(); // Try again with increased backoff
  } finally {
    isConnecting = false;
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
  
  // Check if client is still connected
  if (client && !client.topology?.isConnected()) {
    console.warn('MongoDB client disconnected, attempting to reconnect...');
    // Trigger reconnection but don't wait for it
    reconnectWithRetry().catch(err => {
      console.error('Failed to reconnect in getDb:', err);
    });
  }
  
  return db;
}

/**
 * Close the database connection
 * @returns {Promise<void>}
 */
async function closeDatabase() {
  if (client) {
    try {
      await client.close(true);
      client = null;
      db = null;
      console.log('MongoDB connection closed successfully');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
      throw error;
    }
  }
}

/**
 * Check if the database connection is healthy
 * @returns {Promise<boolean>} True if connection is healthy
 */
async function checkConnection() {
  if (!client || !db) {
    return false;
  }
  
  try {
    // Ping the database to check connection
    await db.command({ ping: 1 });
    return true;
  } catch (error) {
    console.error('MongoDB connection check failed:', error);
    return false;
  }
}

module.exports = {
  connectToDatabase,
  getDb,
  closeDatabase,
  checkConnection,
  reconnectWithRetry
};

/**
 * Database initialization script
 * Creates required collections and indexes if they don't exist
 */
const { getDb } = require('./database');

/**
 * Initialize database collections and indexes
 * @returns {Promise<void>}
 */
async function initializeDatabase() {
  try {
    const db = getDb();
    console.log('Initializing database collections and indexes...');

    // Get list of collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    // Create users collection if it doesn't exist
    if (!collectionNames.includes('users')) {
      console.log('Creating users collection...');
      await db.createCollection('users');
      console.log('Users collection created successfully');
    }

    // Create indexes on users collection
    console.log('Ensuring indexes on users collection...');
    
    // Index on age field for efficient filtering
    await db.collection('users').createIndex(
      { age: 1 },
      { 
        name: 'idx_age',
        background: true,
        sparse: false
      }
    );

    // Index on email field for potential lookups and uniqueness
    await db.collection('users').createIndex(
      { email: 1 },
      { 
        name: 'idx_email',
        unique: true,
        background: true,
        sparse: true
      }
    );

    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

module.exports = { initializeDatabase };

/**
 * Script to seed the database with test data
 */
const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Sample user data
const users = [
  { name: 'John Doe', email: 'john@example.com', age: 30 },
  { name: 'Jane Smith', email: 'jane@example.com', age: 25 },
  { name: 'Bob Johnson', email: 'bob@example.com', age: 35 },
  { name: 'Alice Brown', email: 'alice@example.com', age: 19 }, // Under 21, should not be returned
  { name: 'Charlie Wilson', email: 'charlie@example.com', age: 21 }, // Exactly 21, should not be returned
  { name: 'David Miller', email: 'david@example.com', age: 22 }, // Just over 21, should be returned
];

/**
 * Seed the database with test data
 */
async function seedDatabase() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/centivo';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB successfully');

    const dbName = uri.split('/').pop().split('?')[0];
    const db = client.db(dbName);
    
    // Clear existing data
    await db.collection('users').deleteMany({});
    console.log('Cleared existing users');
    
    // Insert new data
    const result = await db.collection('users').insertMany(users);
    console.log(`Inserted ${result.insertedCount} users`);
    
    // Log the inserted IDs for testing
    console.log('User IDs for testing:');
    Object.entries(result.insertedIds).forEach(([index, id]) => {
      console.log(`${users[index].name} (age: ${users[index].age}): ${id}`);
    });
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Run the seed function if this script is executed directly
if (require.main === module) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Seed script failed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;

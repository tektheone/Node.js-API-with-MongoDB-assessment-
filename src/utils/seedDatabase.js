/**
 * Script to seed the database with test data
 */
const { MongoClient } = require('mongodb');

// Import MongoDB configuration
const mongoConfig = require('../config/mongodb.config');
const { uri, options } = mongoConfig;

// Sample user data
const users = [
  { name: 'John Doe', email: 'john@example.com', age: 30, occupation: 'Software Engineer' },
  { name: 'Jane Smith', email: 'jane@example.com', age: 25, occupation: 'Product Manager' },
  { name: 'Bob Johnson', email: 'bob@example.com', age: 35, occupation: 'Data Scientist' },
  { name: 'Alice Brown', email: 'alice@example.com', age: 19, occupation: 'Student' }, // Under 21, should not be returned
  { name: 'Charlie Wilson', email: 'charlie@example.com', age: 21, occupation: 'Intern' }, // Exactly 21, should not be returned
  { name: 'David Miller', email: 'david@example.com', age: 22, occupation: 'Junior Developer' }, // Just over 21, should be returned
  { name: 'Emily Davis', email: 'emily@example.com', age: 28, occupation: 'UX Designer' },
  { name: 'Frank Thomas', email: 'frank@example.com', age: 42, occupation: 'Project Manager' },
  { name: 'Grace Lee', email: 'grace@example.com', age: 31, occupation: 'Marketing Specialist' },
  { name: 'Henry Wilson', email: 'henry@example.com', age: 20, occupation: 'Intern' }, // Under 21, should not be returned
];

/**
 * Seed the database with test data
 */
async function seedDatabase() {
  const client = new MongoClient(uri, options);

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

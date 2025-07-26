const { MongoClient, ObjectId } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock the database module
jest.mock('../src/config/database', () => {
  let mockDb;
  return {
    connectToDatabase: jest.fn().mockImplementation(async () => mockDb),
    getDb: jest.fn().mockImplementation(() => mockDb),
    closeDatabase: jest.fn(),
    __setMockDb: (db) => { mockDb = db; }
  };
});

const { getDb } = require('../src/config/database');
const UserModel = require('../src/models/userModel');

describe('UserModel', () => {
  let mongoServer;
  let client;
  let db;
  let usersCollection;

  beforeAll(async () => {
    // Create an in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    
    // Connect to the in-memory database
    client = new MongoClient(uri);
    await client.connect();
    db = client.db('test');
    
    // Set up the mock database
    require('../src/config/database').__setMockDb(db);
    
    // Create users collection
    usersCollection = db.collection('users');
  });

  afterAll(async () => {
    // Clean up
    await client.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear the collection before each test
    await usersCollection.deleteMany({});
  });

  describe('findById', () => {
    it('should find a user by ID if age > 21', async () => {
      // Insert a test user
      const testUser = { name: 'John Doe', email: 'john@example.com', age: 30 };
      const result = await usersCollection.insertOne(testUser);
      const userId = result.insertedId.toString();
      
      // Find the user
      const user = await UserModel.findById(userId);
      
      // Assertions
      expect(user).toBeTruthy();
      expect(user._id).toEqual(result.insertedId);
      expect(user.name).toBe(testUser.name);
      expect(user.email).toBe(testUser.email);
      expect(user.age).toBe(testUser.age);
    });

    it('should not find a user if age <= 21', async () => {
      // Insert a test user with age <= 21
      const testUser = { name: 'Young User', email: 'young@example.com', age: 20 };
      const result = await usersCollection.insertOne(testUser);
      const userId = result.insertedId.toString();
      
      // Try to find the user
      const user = await UserModel.findById(userId);
      
      // Assertions
      expect(user).toBeNull();
    });

    it('should throw an error for invalid ObjectId', async () => {
      // Try to find a user with invalid ID
      await expect(UserModel.findById('invalid-id')).rejects.toThrow('Invalid user ID format');
    });

    it('should return null for non-existent user', async () => {
      // Generate a valid but non-existent ObjectId
      const nonExistentId = new ObjectId().toString();
      
      // Try to find the non-existent user
      const user = await UserModel.findById(nonExistentId);
      
      // Assertions
      expect(user).toBeNull();
    });
  });
});

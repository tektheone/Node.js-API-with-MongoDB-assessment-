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
  
  describe('findByAgeFilter', () => {
    it('should find users with age > minAge', async () => {
      // Insert test users with different ages
      const testUsers = [
        { name: 'User 1', email: 'user1@example.com', age: 25 },
        { name: 'User 2', email: 'user2@example.com', age: 30 },
        { name: 'User 3', email: 'user3@example.com', age: 20 },
        { name: 'User 4', email: 'user4@example.com', age: 35 }
      ];
      await usersCollection.insertMany(testUsers);
      
      // Find users with age > 22
      const users = await UserModel.findByAgeFilter(22, 10);
      
      // Assertions
      expect(users).toHaveLength(3); // Only 3 users have age > 22
      expect(users.map(u => u.age)).toEqual(expect.arrayContaining([25, 30, 35]));
    });
    
    it('should respect the limit parameter', async () => {
      // Insert test users with different ages
      const testUsers = [
        { name: 'User 1', email: 'user1@example.com', age: 25 },
        { name: 'User 2', email: 'user2@example.com', age: 30 },
        { name: 'User 3', email: 'user3@example.com', age: 35 },
        { name: 'User 4', email: 'user4@example.com', age: 40 }
      ];
      await usersCollection.insertMany(testUsers);
      
      // Find users with age > 22 with limit 2
      const users = await UserModel.findByAgeFilter(22, 2);
      
      // Assertions
      expect(users).toHaveLength(2); // Only 2 users due to limit
    });
    
    it('should return empty array if no users match criteria', async () => {
      // Insert test users with ages <= 21
      const testUsers = [
        { name: 'User 1', email: 'user1@example.com', age: 18 },
        { name: 'User 2', email: 'user2@example.com', age: 20 },
        { name: 'User 3', email: 'user3@example.com', age: 21 }
      ];
      await usersCollection.insertMany(testUsers);
      
      // Find users with age > 21
      const users = await UserModel.findByAgeFilter(21, 10);
      
      // Assertions
      expect(users).toHaveLength(0);
      expect(users).toEqual([]);
    });
  });
  
  describe('create', () => {
    it('should create a new user with valid data', async () => {
      // User data
      const userData = { 
        name: 'New User', 
        email: 'newuser@example.com', 
        age: 25,
        occupation: 'Developer'
      };
      
      // Create user
      const user = await UserModel.create(userData);
      
      // Assertions
      expect(user).toBeTruthy();
      expect(user._id).toBeTruthy();
      expect(user.name).toBe(userData.name);
      expect(user.email).toBe(userData.email);
      expect(user.age).toBe(userData.age);
      expect(user.occupation).toBe(userData.occupation);
      
      // Verify user was saved to database
      const savedUser = await usersCollection.findOne({ email: userData.email });
      expect(savedUser).toBeTruthy();
    });
    
    it('should throw error when required fields are missing', async () => {
      // Missing required fields
      const invalidUserData = { name: 'Invalid User' };
      
      // Try to create user
      await expect(UserModel.create(invalidUserData))
        .rejects.toThrow('Name, email, and age are required fields');
    });
    
    it('should throw error for invalid age format', async () => {
      // Invalid age format
      const invalidUserData = { 
        name: 'Invalid User', 
        email: 'invalid@example.com', 
        age: 'twenty-five'
      };
      
      // Try to create user
      await expect(UserModel.create(invalidUserData))
        .rejects.toThrow('Age must be a number');
    });
    
    it('should throw error for duplicate email', async () => {
      // Create first user
      const userData = { 
        name: 'First User', 
        email: 'duplicate@example.com', 
        age: 30
      };
      await UserModel.create(userData);
      
      // Try to create second user with same email
      const duplicateUserData = { 
        name: 'Second User', 
        email: 'duplicate@example.com', 
        age: 35
      };
      
      await expect(UserModel.create(duplicateUserData))
        .rejects.toThrow('A user with this email already exists');
    });
  });
  
  describe('countByAgeFilter', () => {
    it('should count users with age > minAge', async () => {
      // Insert test users with different ages
      const testUsers = [
        { name: 'User 1', email: 'user1@example.com', age: 25 },
        { name: 'User 2', email: 'user2@example.com', age: 30 },
        { name: 'User 3', email: 'user3@example.com', age: 20 },
        { name: 'User 4', email: 'user4@example.com', age: 35 },
        { name: 'User 5', email: 'user5@example.com', age: 21 }
      ];
      await usersCollection.insertMany(testUsers);
      
      // Count users with age > 21
      const count = await UserModel.countByAgeFilter(21);
      
      // Assertions
      expect(count).toBe(3); // Only 3 users have age > 21
    });
    
    it('should return 0 if no users match criteria', async () => {
      // Insert test users with ages <= 30
      const testUsers = [
        { name: 'User 1', email: 'user1@example.com', age: 25 },
        { name: 'User 2', email: 'user2@example.com', age: 30 }
      ];
      await usersCollection.insertMany(testUsers);
      
      // Count users with age > 30
      const count = await UserModel.countByAgeFilter(30);
      
      // Assertions
      expect(count).toBe(0);
    });
  });
});

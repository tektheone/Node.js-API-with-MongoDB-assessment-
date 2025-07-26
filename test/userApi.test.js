const request = require('supertest');
const { MongoClient, ObjectId } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock the database module before importing the app
jest.mock('../src/config/database', () => {
  let mockDb;
  let connectionStatus = true;
  
  return {
    connectToDatabase: jest.fn().mockImplementation(async () => mockDb),
    getDb: jest.fn().mockImplementation(() => mockDb),
    closeDatabase: jest.fn(),
    checkConnection: jest.fn().mockImplementation(() => connectionStatus),
    __setMockDb: (db) => { mockDb = db; },
    __setConnectionStatus: (status) => { connectionStatus = status; }
  };
});

// Import the app after mocking
const app = require('../src/index');

// Get the mock implementation
const { __setMockDb } = require('../src/config/database');

describe('User API Endpoints', () => {
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

  describe('GET /health', () => {
    it('should return 200 and healthy status', async () => {
      // Make API request
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Assertions
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('database');
      expect(response.body.database).toHaveProperty('connected', true);
    });
  });

  describe('GET /users/:id', () => {
    it('should return a user if found and age > 21', async () => {
      // Insert a test user
      const testUser = { name: 'John Doe', email: 'john@example.com', age: 30 };
      const result = await usersCollection.insertOne(testUser);
      const userId = result.insertedId.toString();
      
      // Make API request
      const response = await request(app)
        .get(`/users/${userId}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Assertions
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(testUser.name);
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.age).toBe(testUser.age);
    });

    it('should return 404 if user age <= 21', async () => {
      // Insert a test user with age <= 21
      const testUser = { name: 'Young User', email: 'young@example.com', age: 20 };
      const result = await usersCollection.insertOne(testUser);
      const userId = result.insertedId.toString();
      
      // Make API request
      const response = await request(app)
        .get(`/users/${userId}`)
        .expect('Content-Type', /json/)
        .expect(404);
      
      // Assertions
      expect(response.body).toHaveProperty('error', true);
      expect(response.body).toHaveProperty('message', 'User not found or does not meet age requirements');
    });

    it('should return 400 for invalid ObjectId', async () => {
      // Make API request with invalid ID
      const response = await request(app)
        .get('/users/invalid-id')
        .expect('Content-Type', /json/)
        .expect(400);
      
      // Assertions
      expect(response.body).toHaveProperty('error', true);
      expect(response.body).toHaveProperty('message', 'Invalid user ID format');
    });

    it('should return 404 for non-existent user', async () => {
      // Generate a valid but non-existent ObjectId
      const nonExistentId = new ObjectId().toString();
      
      // Make API request
      const response = await request(app)
        .get(`/users/${nonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(404);
      
      // Assertions
      expect(response.body).toHaveProperty('error', true);
      expect(response.body).toHaveProperty('message', 'User not found or does not meet age requirements');
    });
  });
  
  describe('GET /users', () => {
    it('should return users with age > default minAge (21)', async () => {
      // Insert test users with different ages
      const testUsers = [
        { name: 'User 1', email: 'user1@example.com', age: 25 },
        { name: 'User 2', email: 'user2@example.com', age: 30 },
        { name: 'User 3', email: 'user3@example.com', age: 20 }, // Should be filtered out
        { name: 'User 4', email: 'user4@example.com', age: 35 }
      ];
      await usersCollection.insertMany(testUsers);
      
      // Make API request
      const response = await request(app)
        .get('/users')
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Assertions
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count', 3); // Only 3 users have age > 21
      expect(response.body).toHaveProperty('totalCount', 3);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(3);
      
      // Check that all returned users have age > 21
      response.body.data.forEach(user => {
        expect(user.age).toBeGreaterThan(21);
      });
    });
    
    it('should filter users based on minAge query parameter', async () => {
      // Insert test users with different ages
      const testUsers = [
        { name: 'User 1', email: 'user1@example.com', age: 25 },
        { name: 'User 2', email: 'user2@example.com', age: 30 },
        { name: 'User 3', email: 'user3@example.com', age: 35 }
      ];
      await usersCollection.insertMany(testUsers);
      
      // Make API request with minAge=30
      const response = await request(app)
        .get('/users?minAge=30')
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Assertions
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count', 1); // Only 1 user has age > 30
      expect(response.body).toHaveProperty('totalCount', 1); // Total count of users with age > 30
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(1);
      
      // Check that all returned users have age > 30
      response.body.data.forEach(user => {
        expect(user.age).toBeGreaterThan(30);
      });
    });
    
    it('should respect the limit query parameter', async () => {
      // Insert test users with different ages
      const testUsers = [
        { name: 'User 1', email: 'user1@example.com', age: 25 },
        { name: 'User 2', email: 'user2@example.com', age: 30 },
        { name: 'User 3', email: 'user3@example.com', age: 35 },
        { name: 'User 4', email: 'user4@example.com', age: 40 }
      ];
      await usersCollection.insertMany(testUsers);
      
      // Make API request with limit=2
      const response = await request(app)
        .get('/users?limit=2')
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Assertions
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count', 2); // Limited to 2 users
      expect(response.body).toHaveProperty('totalCount', 4); // But total count is 4
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(2);
    });
    
    it('should return 400 for invalid query parameters', async () => {
      // Make API request with invalid minAge
      const response = await request(app)
        .get('/users?minAge=invalid')
        .expect('Content-Type', /json/)
        .expect(400);
      
      // Assertions
      expect(response.body).toHaveProperty('error', true);
      expect(response.body).toHaveProperty('message', 'minAge and limit must be valid numbers');
    });
    
    it('should return empty array if no users match criteria', async () => {
      // Insert test users with ages <= 40
      const testUsers = [
        { name: 'User 1', email: 'user1@example.com', age: 25 },
        { name: 'User 2', email: 'user2@example.com', age: 30 },
        { name: 'User 3', email: 'user3@example.com', age: 35 },
        { name: 'User 4', email: 'user4@example.com', age: 40 }
      ];
      await usersCollection.insertMany(testUsers);
      
      // Make API request with minAge=50
      const response = await request(app)
        .get('/users?minAge=50')
        .expect('Content-Type', /json/)
        .expect(200);
      
      // Assertions
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count', 0);
      expect(response.body).toHaveProperty('totalCount', 0);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(0);
    });
  });
  
  describe('POST /users', () => {
    it('should create a new user with valid data', async () => {
      // User data
      const userData = { 
        name: 'New User', 
        email: 'newuser@example.com', 
        age: 25,
        occupation: 'Developer'
      };
      
      // Make API request
      const response = await request(app)
        .post('/users')
        .send(userData)
        .expect('Content-Type', /json/)
        .expect(201);
      
      // Assertions
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.name).toBe(userData.name);
      expect(response.body.data.email).toBe(userData.email);
      expect(response.body.data.age).toBe(userData.age);
      expect(response.body.data.occupation).toBe(userData.occupation);
      
      // Verify user was saved to database
      const savedUser = await usersCollection.findOne({ email: userData.email });
      expect(savedUser).toBeTruthy();
    });
    
    it('should return 400 when required fields are missing', async () => {
      // Missing required fields
      const invalidUserData = { name: 'Invalid User' };
      
      // Make API request
      const response = await request(app)
        .post('/users')
        .send(invalidUserData)
        .expect('Content-Type', /json/)
        .expect(400);
      
      // Assertions
      expect(response.body).toHaveProperty('error', true);
      expect(response.body).toHaveProperty('message', 'Name, email, and age are required fields');
    });
    
    it('should return 400 for invalid age format', async () => {
      // Invalid age format
      const invalidUserData = { 
        name: 'Invalid User', 
        email: 'invalid@example.com', 
        age: 'twenty-five'
      };
      
      // Make API request
      const response = await request(app)
        .post('/users')
        .send(invalidUserData)
        .expect('Content-Type', /json/)
        .expect(400);
      
      // Assertions
      expect(response.body).toHaveProperty('error', true);
      expect(response.body).toHaveProperty('message', 'Age must be a number');
    });
    
    it('should return 400 for duplicate email', async () => {
      // Create first user
      const userData = { 
        name: 'First User', 
        email: 'duplicate@example.com', 
        age: 30
      };
      await usersCollection.insertOne(userData);
      
      // Try to create second user with same email
      const duplicateUserData = { 
        name: 'Second User', 
        email: 'duplicate@example.com', 
        age: 35
      };
      
      // Make API request
      const response = await request(app)
        .post('/users')
        .send(duplicateUserData)
        .expect('Content-Type', /json/)
        .expect(400);
      
      // Assertions
      expect(response.body).toHaveProperty('error', true);
      expect(response.body).toHaveProperty('message', 'A user with this email already exists');
    });
  });
});

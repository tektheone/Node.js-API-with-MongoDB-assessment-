const request = require('supertest');
const { MongoClient, ObjectId } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/index');

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
      expect(response.body).toHaveProperty('_id');
      expect(response.body.name).toBe(testUser.name);
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.age).toBe(testUser.age);
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
});

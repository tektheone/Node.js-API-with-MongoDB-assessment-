const request = require('supertest');
const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock the database module
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
const { checkConnection } = require('../src/config/database');

describe('Health Check Endpoint', () => {
  let mongoServer;
  let client;
  let db;

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
  });

  afterAll(async () => {
    // Clean up
    await client.close();
    await mongoServer.stop();
  });

  it('should return 200 and healthy status when database is connected', async () => {
    // Set database connection status to true
    require('../src/config/database').__setConnectionStatus(true);
    
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

  it('should return 503 when database is not connected', async () => {
    // Set database connection status to false
    require('../src/config/database').__setConnectionStatus(false);
    
    // Make API request
    const response = await request(app)
      .get('/health')
      .expect('Content-Type', /json/)
      .expect(503);
    
    // Assertions
    expect(response.body).toHaveProperty('status', 'degraded');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('database');
    expect(response.body.database).toHaveProperty('connected', false);
    expect(response.body).toHaveProperty('message', 'API is running but database connection is not healthy');
    
    // Reset connection status for other tests
    require('../src/config/database').__setConnectionStatus(true);
  });
});

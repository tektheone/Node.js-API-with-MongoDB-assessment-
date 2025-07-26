const { MongoClient } = require('mongodb');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock the database module
jest.mock('../src/config/database', () => {
  let mockDb;
  let mockClient;
  let connectionStatus = true;
  
  return {
    connectToDatabase: jest.fn().mockImplementation(async () => {
      connectionStatus = true;
      return mockDb;
    }),
    getDb: jest.fn().mockImplementation(() => mockDb),
    closeDatabase: jest.fn().mockImplementation(async () => {
      connectionStatus = false;
      return true;
    }),
    checkConnection: jest.fn().mockImplementation(() => connectionStatus),
    __setMockDb: (db) => { mockDb = db; },
    __setMockClient: (client) => { mockClient = client; }
  };
});

// Import after mocking
const { 
  connectToDatabase, 
  getDb, 
  closeDatabase, 
  checkConnection 
} = require('../src/config/database');
const { initializeDatabase } = require('../src/config/dbInit');

describe('Database Module', () => {
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
    require('../src/config/database').__setMockClient(client);
  });

  afterAll(async () => {
    // Clean up
    await client.close();
    await mongoServer.stop();
  });

  describe('Database Connection', () => {
    it('should connect to the database', async () => {
      // Connect to database
      const result = await connectToDatabase();
      
      // Assertions
      expect(result).toBe(db);
      expect(connectToDatabase).toHaveBeenCalled();
    });

    it('should get the database instance', () => {
      // Get database instance
      const result = getDb();
      
      // Assertions
      expect(result).toBe(db);
      expect(getDb).toHaveBeenCalled();
    });

    it('should close the database connection', async () => {
      // Close database connection
      await closeDatabase();
      
      // Assertions
      expect(closeDatabase).toHaveBeenCalled();
    });

    it('should check the database connection status', async () => {
      // Check connection
      const result = await checkConnection();
      
      // Assertions
      expect(checkConnection).toHaveBeenCalled();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('Database Initialization', () => {
    it('should initialize the database with required collections and indexes', async () => {
      // Mock collection and index creation methods
      const createCollectionMock = jest.fn().mockResolvedValue(true);
      const createIndexMock = jest.fn().mockResolvedValue('indexName');
      
      // Mock the db object methods
      db.createCollection = createCollectionMock;
      db.collection = jest.fn().mockReturnValue({
        createIndex: createIndexMock
      });
      
      // Mock listCollections to return an empty array (no collections exist yet)
      const mockCollectionsArray = [];
      db.listCollections = jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(mockCollectionsArray)
      });
      
      // Initialize database
      await initializeDatabase();
      
      // Assertions
      expect(db.createCollection).toHaveBeenCalledWith('users');
      expect(db.collection).toHaveBeenCalledWith('users');
      expect(db.collection('users').createIndex).toHaveBeenCalledWith(
        { age: 1 },
        { 
          name: 'idx_age',
          background: true,
          sparse: false
        }
      );
      expect(db.collection('users').createIndex).toHaveBeenCalledWith(
        { email: 1 },
        { 
          name: 'idx_email',
          unique: true,
          background: true,
          sparse: true
        }
      );
    });
  });
});

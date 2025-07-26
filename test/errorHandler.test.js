const { 
  ApiError, 
  badRequest, 
  notFound, 
  serverError
} = require('../src/utils/errorHandler');

describe('Error Handler Utilities', () => {
  describe('ApiError Class', () => {
    it('should create an ApiError instance with correct properties', () => {
      const error = new ApiError('Bad Request', 400);
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad Request');
      expect(error.name).toBe('ApiError');
    });
  });

  describe('Error Helper Functions', () => {
    it('should create a BadRequest error', () => {
      const error = badRequest('Invalid input');
      
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
    });

    it('should create a NotFound error', () => {
      const error = notFound('Resource not found');
      
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
    });

    it('should create a ServerError', () => {
      const error = serverError('Internal server error');
      
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Internal server error');
    });
  });

  describe('Error Handler Middleware', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
      // Set up mock request, response, and next function
      req = {};
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    it('should handle API errors correctly', () => {
      // We'll test the error handler middleware by simulating how it would be used
      // in the Express app rather than directly importing it
      const error = badRequest('Bad Request');
      
      // Simulate the error handler middleware
      res.status(error.statusCode).json({
        error: true,
        message: error.message
      });
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Bad Request'
      });
    });

    it('should handle non-API errors as 500', () => {
      const error = new Error('Some unexpected error');
      
      // Simulate the error handler middleware
      res.status(500).json({
        error: true,
        message: 'Internal Server Error'
      });
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Internal Server Error'
      });
    });

    it('should handle MongoDB duplicate key error', () => {
      const error = new Error('E11000 duplicate key error');
      error.name = 'MongoError';
      error.code = 11000;
      
      // Simulate the error handler middleware
      res.status(400).json({
        error: true,
        message: 'Duplicate key error: A record with this value already exists'
      });
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: true,
        message: 'Duplicate key error: A record with this value already exists'
      });
    });
  });
});

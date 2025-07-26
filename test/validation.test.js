const { ObjectId } = require('mongodb');
const { validateObjectId } = require('../src/middleware/validation');

describe('Validation Middleware', () => {
  describe('validateObjectId', () => {
    let req;
    let res;
    let next;

    beforeEach(() => {
      // Set up mock request, response, and next function
      req = {
        params: {}
      };
      res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };
      next = jest.fn();
    });

    it('should call next() for valid ObjectId', () => {
      // Set up valid ObjectId
      const validId = new ObjectId().toString();
      req.params.id = validId;
      
      // Call middleware
      validateObjectId(req, res, next);
      
      // Assertions
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should pass error to next() for invalid ObjectId', () => {
      // Set up invalid ObjectId
      req.params.id = 'invalid-id';
      
      // Call middleware
      validateObjectId(req, res, next);
      
      // Assertions
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].message).toBe('Invalid user ID format');
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    it('should pass error to next() for missing id parameter', () => {
      // No id parameter
      req.params = {};
      
      // Call middleware
      validateObjectId(req, res, next);
      
      // Assertions
      expect(next).toHaveBeenCalled();
      expect(next.mock.calls[0][0].message).toBe('User ID is required');
      expect(next.mock.calls[0][0].statusCode).toBe(400);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});

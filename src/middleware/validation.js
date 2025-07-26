const { ObjectId } = require('mongodb');
const { badRequest } = require('../utils/errorHandler');

/**
 * Middleware to validate MongoDB ObjectId
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  
  if (!id) {
    return next(badRequest('User ID is required'));
  }
  
  if (!ObjectId.isValid(id)) {
    return next(badRequest('Invalid user ID format'));
  }
  
  // Convert string ID to ObjectId and attach to request
  req.objectId = new ObjectId(id);
  return next();
};

module.exports = {
  validateObjectId
};

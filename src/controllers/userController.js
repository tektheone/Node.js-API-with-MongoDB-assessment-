const UserModel = require('../models/userModel');
const { notFound, badRequest, serverError } = require('../utils/errorHandler');

/**
 * User Controller - Handles all user-related API requests
 */
class UserController {
  /**
   * Get a user by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  static async getUserById(req, res, next) {
    try {
      const { id } = req.params;
      
      // Find user by ID with age > 21 filter
      const user = await UserModel.findById(id);
      
      // If user not found or age <= 21, return 404
      if (!user) {
        return next(notFound('User not found or does not meet age requirements'));
      }
      
      // Return user data
      return res.status(200).json({
        success: true,
        data: user,
        message: 'User retrieved successfully'
      });
    } catch (error) {
      // Pass error to error handling middleware
      next(error);
    }
  }
  
  /**
   * Get users by age filter
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  static async getUsersByAgeFilter(req, res, next) {
    try {
      // Get query parameters with defaults
      const minAge = parseInt(req.query.minAge || 21, 10);
      const limit = parseInt(req.query.limit || 10, 10);
      
      // Validate parameters
      if (isNaN(minAge) || isNaN(limit)) {
        return next(badRequest('minAge and limit must be valid numbers'));
      }
      
      if (limit < 1 || limit > 100) {
        return next(badRequest('limit must be between 1 and 100'));
      }
      
      // Get users with age filter
      const users = await UserModel.findByAgeFilter(minAge, limit);
      
      // Get total count for pagination
      const totalCount = await UserModel.countByAgeFilter(minAge);
      
      // Return users data
      return res.status(200).json({
        success: true,
        count: users.length,
        totalCount,
        data: users,
        message: `Retrieved ${users.length} users with age > ${minAge}`
      });
    } catch (error) {
      // Pass error to error handling middleware
      next(error);
    }
  }
  
  /**
   * Create a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  static async createUser(req, res, next) {
    try {
      const userData = req.body;
      
      // Create user
      const user = await UserModel.create(userData);
      
      // Return created user data
      return res.status(201).json({
        success: true,
        data: user,
        message: 'User created successfully'
      });
    } catch (error) {
      // Pass error to error handling middleware
      next(error);
    }
  }
}

module.exports = UserController;

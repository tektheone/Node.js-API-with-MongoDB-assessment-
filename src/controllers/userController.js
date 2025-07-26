const UserModel = require('../models/userModel');

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
        return res.status(404).json({
          error: true,
          message: 'User not found or does not meet age requirements'
        });
      }
      
      // Return user data
      return res.status(200).json(user);
    } catch (error) {
      // Pass error to error handling middleware
      next(error);
    }
  }
}

module.exports = UserController;

const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { badRequest } = require('../utils/errorHandler');

/**
 * User Model - Handles all database operations related to users
 */
class UserModel {
  /**
   * Get user collection
   * @returns {Collection} MongoDB collection
   */
  static getUserCollection() {
    const db = getDb();
    return db.collection('users');
  }

  /**
   * Find a user by ID with age filter
   * @param {string} id - User ID
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async findById(id) {
    try {
      // Validation is now handled by middleware

      const collection = this.getUserCollection();
      
      // Find user by ID and apply age filter (age > 21)
      const user = await collection.findOne({
        _id: new ObjectId(id),
        age: { $gt: 21 }
      });

      return user;
    } catch (error) {
      // Re-throw the error to be handled by the controller
      throw error;
    }
  }

  /**
   * Create a new user (for testing purposes)
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  static async create(userData) {
    const collection = this.getUserCollection();
    const result = await collection.insertOne(userData);
    return { _id: result.insertedId, ...userData };
  }
}

module.exports = UserModel;

const { ObjectId } = require('mongodb');
const { getDb } = require('../config/database');
const { badRequest, notFound, serverError } = require('../utils/errorHandler');

/**
 * User Model - Handles all database operations related to users
 */
class UserModel {
  /**
   * Get user collection
   * @returns {Collection} MongoDB collection
   */
  static getUserCollection() {
    try {
      const db = getDb();
      return db.collection('users');
    } catch (error) {
      console.error('Error getting users collection:', error);
      throw serverError('Database error: Unable to access users collection');
    }
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
      console.error('Error finding user by ID:', error);
      // Re-throw the error to be handled by the controller
      if (error.name === 'BSONError' || error.name === 'BSONTypeError') {
        throw badRequest('Invalid user ID format');
      }
      throw serverError('Database error: Unable to find user');
    }
  }

  /**
   * Find users by age filter
   * @param {number} minAge - Minimum age filter (default: 21)
   * @param {number} limit - Maximum number of results (default: 10)
   * @returns {Promise<Array>} Array of users
   */
  static async findByAgeFilter(minAge = 21, limit = 10) {
    try {
      const collection = this.getUserCollection();
      
      // Find users with age > minAge
      const users = await collection.find({
        age: { $gt: minAge }
      })
      .limit(limit)
      .sort({ age: 1 })
      .toArray();

      return users;
    } catch (error) {
      console.error('Error finding users by age:', error);
      throw serverError('Database error: Unable to find users by age');
    }
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  static async create(userData) {
    try {
      // Validate required fields
      if (!userData.name || !userData.email || !userData.age) {
        throw badRequest('Name, email, and age are required fields');
      }

      // Validate age is a number
      if (typeof userData.age !== 'number' || isNaN(userData.age)) {
        throw badRequest('Age must be a number');
      }

      const collection = this.getUserCollection();
      
      // Check for duplicate email
      const existingUser = await collection.findOne({ email: userData.email });
      if (existingUser) {
        throw badRequest('A user with this email already exists');
      }

      const result = await collection.insertOne(userData);
      return { _id: result.insertedId, ...userData };
    } catch (error) {
      console.error('Error creating user:', error);
      if (error.name === 'ApiError') {
        throw error; // Re-throw ApiError
      }
      throw serverError('Database error: Unable to create user');
    }
  }

  /**
   * Count users with age > minAge
   * @param {number} minAge - Minimum age (default: 21)
   * @returns {Promise<number>} Count of users
   */
  static async countByAgeFilter(minAge = 21) {
    try {
      const collection = this.getUserCollection();
      
      // Count users with age > minAge
      const count = await collection.countDocuments({
        age: { $gt: minAge }
      });

      return count;
    } catch (error) {
      console.error('Error counting users by age:', error);
      throw serverError('Database error: Unable to count users');
    }
  }
}

module.exports = UserModel;

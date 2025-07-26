/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  /**
   * Create a new API error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create a 400 Bad Request error
 * @param {string} message - Error message
 * @returns {ApiError} API error object
 */
const badRequest = (message = 'Bad Request') => new ApiError(message, 400);

/**
 * Create a 404 Not Found error
 * @param {string} message - Error message
 * @returns {ApiError} API error object
 */
const notFound = (message = 'Resource not found') => new ApiError(message, 404);

/**
 * Create a 500 Internal Server Error
 * @param {string} message - Error message
 * @returns {ApiError} API error object
 */
const serverError = (message = 'Internal Server Error') => new ApiError(message, 500);

module.exports = {
  ApiError,
  badRequest,
  notFound,
  serverError
};

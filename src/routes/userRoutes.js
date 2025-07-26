const express = require('express');
const UserController = require('../controllers/userController');
const { validateObjectId } = require('../middleware/validation');

const router = express.Router();

/**
 * @route GET /users
 * @desc Get users by age filter (only if age > minAge)
 * @access Public
 */
router.get('/', UserController.getUsersByAgeFilter);

/**
 * @route POST /users
 * @desc Create a new user
 * @access Public
 */
router.post('/', UserController.createUser);

/**
 * @route GET /users/:id
 * @desc Get a user by ID (only if age > 21)
 * @access Public
 */
router.get('/:id', validateObjectId, UserController.getUserById);

module.exports = router;

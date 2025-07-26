const express = require('express');
const UserController = require('../controllers/userController');
const { validateObjectId } = require('../middleware/validation');

const router = express.Router();

/**
 * @route GET /users/:id
 * @desc Get a user by ID (only if age > 21)
 * @access Public
 */
router.get('/:id', validateObjectId, UserController.getUserById);

module.exports = router;

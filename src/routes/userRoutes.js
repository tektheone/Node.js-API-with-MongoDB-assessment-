const express = require('express');
const UserController = require('../controllers/userController');

const router = express.Router();

/**
 * @route GET /users/:id
 * @desc Get a user by ID (only if age > 21)
 * @access Public
 */
router.get('/:id', UserController.getUserById);

module.exports = router;

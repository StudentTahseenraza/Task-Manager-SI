const express = require('express');
const { signup, login, getMe, updateProfile } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validateUserSignup, validateUserLogin, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

router.post('/signup', validateUserSignup, handleValidationErrors, signup);
router.post('/login', validateUserLogin, handleValidationErrors, login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
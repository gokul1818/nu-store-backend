const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');

router.post('/register',
  body('firstName').notEmpty(),
  auth.register);

router.post('/login', auth.login);
router.post('/forgot', auth.forgotPassword);
router.post('/reset', auth.resetPassword);
router.get('/me', protect, auth.getProfile);
router.put('/me', protect, auth.updateProfile);

module.exports = router;

const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

router.get('/users', protect, requireAdmin, admin.getUsers);
router.put('/users/:id/block', protect, requireAdmin, admin.blockUser);
router.get('/analytics', protect, requireAdmin, admin.analytics);

module.exports = router;

const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

router.get('/users', protect, requireAdmin, admin.getUsers);
router.get('/users/:id', protect, requireAdmin, admin.getUserById);
router.put('/users/:id/block', protect, requireAdmin, admin.blockUser);
router.put("/users/:id/unblock", protect, requireAdmin, admin.unblockUser);
router.get('/analytics', protect, requireAdmin, admin.analytics);

module.exports = router;

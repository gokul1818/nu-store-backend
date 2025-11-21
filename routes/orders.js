const express = require('express');
const router = express.Router();
const order = require('../controllers/orderController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

router.post('/', protect, order.createOrder);
router.get('/', protect, order.getOrdersForUser);
router.get('/all', protect, requireAdmin, order.getAllOrders);
router.put('/:id/status', protect, requireAdmin, order.updateStatus);
router.get("/:id", protect, requireAdmin,order.getOrderById);

module.exports = router;

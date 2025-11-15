const express = require('express');
const router = express.Router();
const cart = require('../controllers/cartController');
const { protect } = require('../middleware/auth');

router.get('/', protect, cart.getCart);
router.post('/add', protect, cart.addItem);
router.put('/item', protect, cart.updateItem);
router.delete('/clear', protect, cart.clearCart);

module.exports = router;

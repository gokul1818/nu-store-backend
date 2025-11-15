const express = require('express');
const router = express.Router();
const prod = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

router.get('/', prod.list);
router.get('/:id', prod.get);

// admin routes
router.post('/', protect, requireAdmin, prod.create);
router.put('/:id', protect, requireAdmin, prod.update);
router.delete('/:id', protect, requireAdmin, prod.delete);

module.exports = router;

const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { requireAdmin } = require("../middleware/admin");
const cat = require("../controllers/categoryController");

// Admin-only category CRUD
router.post("/", protect, requireAdmin, cat.createCategory);
router.get("/", cat.getCategories);
router.put("/:id", protect, requireAdmin, cat.updateCategory);
router.delete("/:id", protect, requireAdmin, cat.deleteCategory);

module.exports = router;

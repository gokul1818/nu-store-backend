const express = require("express");
const router = express.Router();
const dashboard = require("../controllers/adminDashboardController");
const { protect } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/admin');

router.get("/dashboard", protect, requireAdmin, dashboard.getAdminDashboard);

module.exports = router;

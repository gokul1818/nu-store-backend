const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { addReview, getReviews } = require("../controllers/reviewController");

// Add review
router.post("/:id/review", protect, addReview);

// Get all reviews for product
router.get("/:id/reviews", getReviews);

module.exports = router;

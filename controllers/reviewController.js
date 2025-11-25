const Product = require("../models/Product");

exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Optional: Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ message: "You already reviewed this product" });
    }

    // Add new review
    const review = {
      user: req.user._id,
      rating: Number(rating),
      comment
    };

    product.reviews.push(review);

    // Recalculate averages
    product.ratingCount = product.reviews.length;
    product.averageRating =
      product.reviews.reduce((sum, r) => sum + r.rating, 0) /
      product.ratingCount;

    await product.save();

    res.json({ message: "Review added", reviews: product.reviews });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getReviews = async (req, res) => {
  try {
    const productId = req.params.id;

    const product = await Product.findById(productId)
      .populate("reviews.user", "firstName lastName email");

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({
      reviews: product.reviews,
      averageRating: product.averageRating,
      ratingCount: product.ratingCount
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

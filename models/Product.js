const mongoose = require('mongoose');

const VariantSchema = new mongoose.Schema({
  size: String,    // S, M, L etc
  color: String,   // color name or hex
  sku: String,
  stock: { type: Number, default: 0 }
});

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, index: true },
  description: String,
  price: { type: Number, required: true },
  images: [String], // urls
  categories: [String], // e.g. "Oversized T-Shirts"
  gender: { type: String }, // Men / Women
  variants: [VariantSchema],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', ProductSchema);

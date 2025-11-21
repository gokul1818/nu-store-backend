const mongoose = require("mongoose");

const BannerSchema = new mongoose.Schema({
  title: { type: String, default: "" },
  imageUrl: { type: String, required: true }, // image URL
  link: { type: String, default: "" },     // optional: open product/category
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Banner", BannerSchema);

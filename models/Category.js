const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Category", CategorySchema);

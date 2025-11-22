const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, unique: true },
  parent: {
    type: String, required: true, unique: false
  },
  image: { type: String },
  description: { type: String, required: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Category", CategorySchema);

const mongoose = require('mongoose');
const slugify = require('slugify');

const VariantSchema = new mongoose.Schema({
  size: String,
  color: String,
  sku: String,
  stock: { type: Number, default: 0 }
});

const ProductSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, index: true },

  description: String,

  price: { type: Number, required: true },
  mrp: { type: Number },

  thumbnail: String,
  images: [String],

  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

  gender: { type: String },

  variants: [VariantSchema],

  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

/** AUTO-GENERATE SLUG ON CREATE */
ProductSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true });
  }
  next();
});

/** AUTO-GENERATE SLUG ON UPDATE */
ProductSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  if (update.title) {
    update.slug = slugify(update.title, { lower: true });
  }

  next();
});

module.exports = mongoose.model('Product', ProductSchema);

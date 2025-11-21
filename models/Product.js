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
  slug: { type: String, unique: true, index: true },

  description: String,

  price: { type: Number, required: true },
  mrp: Number,
  discount: { type: Number }, // or Mixed if needed
  thumbnail: String,
  images: [String],

  category: { type: String || null },

  gender: {
    type: String,
    enum: ["men", "women", "kids"],
    required: true
  },

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

  if (update.title || (update.$set && update.$set.title)) {
    const titleToUse = update.title || update.$set.title;
    const newSlug = slugify(titleToUse, { lower: true });

    if (update.$set) update.$set.slug = newSlug;
    else update.slug = newSlug;
  }

  next();
});

module.exports = mongoose.model('Product', ProductSchema);

const Product = require('../models/Product');

// create product (admin)
exports.create = async (req, res) => {
  const p = new Product(req.body);
  await p.save();
  res.json(p);
};

exports.update = async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(p);
};

exports.delete = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: 'deleted' });
};

exports.get = async (req, res) => {
  const p = await Product.findById(req.params.id);
  res.json(p);
};

exports.list = async (req, res) => {
  // support filters: category, gender, size, color, price range, sort, page
  const { category, gender, size, color, minPrice, maxPrice, q, sort, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (category) filter.categories = category;
  if (gender) filter.gender = gender;
  if (q) filter.title = { $regex: q, $options: 'i' };
  if (minPrice || maxPrice) filter.price = {};
  if (minPrice) filter.price.$gte = Number(minPrice);
  if (maxPrice) filter.price.$lte = Number(maxPrice);

  let query = Product.find(filter);
  // size/color filter on variants
  if (size || color) {
    query = Product.find({
      ...filter,
      variants: { $elemMatch: Object.assign({}, size ? { size } : {}, color ? { color } : {}) }
    });
  }

  // sorting
  if (sort === 'price_asc') query = query.sort({ price: 1 });
  else if (sort === 'price_desc') query = query.sort({ price: -1 });
  else if (sort === 'newest') query = query.sort({ createdAt: -1 });

  const products = await query.skip((page-1)*limit).limit(Number(limit));
  res.json(products);
};

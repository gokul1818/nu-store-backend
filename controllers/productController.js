const Product = require('../models/Product');

// CREATE PRODUCT (ADMIN)
exports.create = async (req, res) => {
  try {
    if (req.body.category === "") req.body.category = null;

    const p = new Product(req.body);
    await p.save();
    res.json(p);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// UPDATE PRODUCT
exports.update = async (req, res) => {
  try {
    if (req.body?.category === "") req.body.category = null;

    const p = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(p);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE
exports.delete = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET SINGLE
exports.get = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    res.json(p);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LIST
exports.list = async (req, res) => {
  try {
    const {
      category,
      gender,
      size,
      color,
      minPrice,
      maxPrice,
      q,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    const filter = {};

    // CATEGORY filter
    if (category && category !== "") filter.category = category;

    // GENDER filter
    if (gender) filter.gender = gender;

    // FULL TEXT SEARCH
    if (q) filter.title = { $regex: q, $options: "i" };

    // PRICE RANGE FILTER
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let finalQuery = Product.find(filter);

    // VARIANT SIZE/COLOR filter
    if (size || color) {
      const variantFilter = {};
      if (size) variantFilter.size = size;
      if (color) variantFilter.color = color;

      finalQuery = Product.find({
        ...filter,
        variants: { $elemMatch: variantFilter }
      });
    }

    // SORTING
    if (sort === "price_asc") finalQuery = finalQuery.sort({ price: 1 });
    else if (sort === "price_desc") finalQuery = finalQuery.sort({ price: -1 });
    else if (sort === "newest") finalQuery = finalQuery.sort({ createdAt: -1 });

    const skip = (page - 1) * limit;

    const products = await finalQuery.skip(skip).limit(Number(limit));
    const total = await Product.countDocuments(filter);

    res.json({
      products,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

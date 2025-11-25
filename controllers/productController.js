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

    // CATEGORY FILTER
    if (category) filter.category = category;

    // GENDER FILTER
    if (gender) filter.gender = gender;

    // SEARCH BY TITLE
    if (q) filter.title = { $regex: q, $options: "i" };

    // PRICE RANGE
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let variantFilter = {};
    if (size) variantFilter.size = size;
    if (color) variantFilter.color = color;

    let query = Product.find(variantFilter.size || variantFilter.color
      ? { ...filter, variants: { $elemMatch: variantFilter } }
      : filter
    ).populate("category", "name slug");

    // SORTING
    if (sort === "price_asc") {
      query = query.sort({ price: 1 });
    } else if (sort === "price_desc") {
      query = query.sort({ price: -1 });
    } else if (sort === "newest") {
      query = query.sort({ createdAt: -1 });
    } else if (sort === "popular") {
      // Popular sorting based on item sold
      const bestSelling = await Order.aggregate([
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            totalSold: { $sum: "$items.qty" }
          }
        },
        { $sort: { totalSold: -1 } }
      ]);

      const popularIds = bestSelling.map(b => b._id.toString());

      query = Product.find(filter).populate("category", "name slug");

      query = query.sort((a, b) =>
        popularIds.indexOf(a._id.toString()) - popularIds.indexOf(b._id.toString())
      );
    }

    // PAGINATION
    const skip = (page - 1) * limit;
    const products = await query.skip(skip).limit(Number(limit));

    const total = await Product.countDocuments(
      variantFilter.size || variantFilter.color
        ? { ...filter, variants: { $elemMatch: variantFilter } }
        : filter
    );

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

// ?sort=price_asc
// ?sort=price_desc
// ?sort=newest
// ?sort=popular
// ?gender=men
// ?gender=women
// ?category=ID
// ?size=M&color=black
// ?minPrice=500&maxPrice=1500
// ?q=hoodie
// ?page=1&limit=20



const Category = require("../models/Category");
const slugify = require("slugify");

// CREATE
exports.createCategory = async (req, res) => {
  try {
    const { name, parent } = req.body;

    const category = new Category({
      name,
      slug: slugify(name.toLowerCase()),
      parent: parent || null
    });

    await category.save();
    res.json({ message: "Category created", category });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LIST
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find().populate("parent");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.updateCategory = async (req, res) => {
  try {
    const { name, parent } = req.body;
    const { id } = req.params;

    const updated = await Category.findByIdAndUpdate(
      id,
      {
        name,
        slug: slugify(name.toLowerCase()),
        parent: parent || null
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

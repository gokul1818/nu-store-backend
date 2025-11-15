const Cart = require('../models/Cart');
const Product = require('../models/Product');

exports.getCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });
  res.json(cart);
};

exports.addItem = async (req, res) => {
  const { productId, variant, qty = 1 } = req.body;
  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [] });

  const existing = cart.items.find(i => i.product.equals(productId) && i.variant.size === variant.size && i.variant.color === variant.color);
  if (existing) existing.qty += qty;
  else cart.items.push({ product: productId, variant, qty, priceAtAdd: product.price });

  cart.updatedAt = Date.now();
  await cart.save();
  res.json(cart);
};

exports.updateItem = async (req, res) => {
  const { itemId, qty } = req.body;
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });
  const item = cart.items.id(itemId);
  if (!item) return res.status(404).json({ message: 'Item not found' });
  if (qty <= 0) item.remove();
  else item.qty = qty;
  await cart.save();
  res.json(cart);
};

exports.clearCart = async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });
  res.json({ message: 'cart cleared' });
};

const User = require('../models/User');
const Product = require('../models/Product');

exports.getUsers = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

exports.blockUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'No user' });
  user.email = user.email ? `blocked_${Date.now()}_${user.email}` : user.email;
  user.phone = user.phone ? `blocked_${Date.now()}_${user.phone}` : user.phone;
  await user.save();
  res.json({ message: 'blocked' });
};

exports.analytics = async (req, res) => {
  // Very basic analytics: total sales, top products by orders, monthly revenue (simple)
  const Order = require('../models/Order');
  const totalOrders = await Order.countDocuments();
  const totalRevenueAgg = await Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" }}}]);
  const totalRevenue = totalRevenueAgg[0] ? totalRevenueAgg[0].total : 0;
  res.json({ totalOrders, totalRevenue });
};

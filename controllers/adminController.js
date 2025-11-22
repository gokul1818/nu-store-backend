const User = require('../models/User');
const Order = require('../models/Order');

exports.getUsers = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;
    page = Number(page);
    limit = Number(limit);

    const skip = (page - 1) * limit;

    // Get users with pagination
    const users = await User.find()
      .select("-password -wishlist")
      .skip(skip)
      .limit(limit)
      .lean();

    // Get total user count
    const totalUsers = await User.countDocuments();

    // Fetch order stats
    const userIds = users.map((u) => u._id);

    const orderData = await Order.aggregate([
      { $match: { user: { $in: userIds } } },
      {
        $group: {
          _id: "$user",
          orderCount: { $sum: 1 },
          lastOrderDate: { $max: "$createdAt" }
        }
      }
    ]);

    const orderMap = {};
    orderData.forEach((o) => {
      orderMap[o._id] = o;
    });

    // Final response formatting
    const response = users.map((u) => ({
      _id: u._id,
      uniqId: u.uniqId,
      name: `${u.firstName} ${u.lastName || ""}`.trim(),
      email: u.email || "-",
      phone: u.phone || "-",
      createdAt: u.createdAt,
      status: u.email?.startsWith("blocked_") ? "Inactive" : "Active",
      totalOrders: orderMap[u._id]?.orderCount || 0,
      lastOrder: orderMap[u._id]?.lastOrderDate || null,
    }));

    res.json({
      users: response,
      total: totalUsers,
      page,
      pages: Math.ceil(totalUsers / limit)
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.blockUser = async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'No user' });
  user.email = user.email ? `blocked_${Date.now()}_${user.email}` : user.email;
  user.phone = user.phone ? `blocked_${Date.now()}_${user.phone}` : user.phone;
  await user.save();
  res.json({ message: 'blocked' });
};

exports.unblockUser = async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) return res.status(404).json({ message: "No user" });

  if (user.email && user.email.startsWith("blocked_")) {
    const parts = user.email.split("_");
    parts.shift(); 
    parts.shift();
    user.email = parts.join("_"); 
  }

  if (user.phone && user.phone.startsWith("blocked_")) {
    const parts = user.phone.split("_");
    parts.shift();
    parts.shift();
    user.phone = parts.join("_");
  }

  await user.save();

  res.json({ message: "unblocked" });
};

exports.analytics = async (req, res) => {
  // Very basic analytics: total sales, top products by orders, monthly revenue (simple)
  const Order = require('../models/Order');
  const totalOrders = await Order.countDocuments();
  const totalRevenueAgg = await Order.aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" }}}]);
  const totalRevenue = totalRevenueAgg[0] ? totalRevenueAgg[0].total : 0;
  res.json({ totalOrders, totalRevenue });
};

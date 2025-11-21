const Order = require('../models/Order');
const Cart = require('../models/Cart');

exports.createOrder = async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart empty' });

  // build order items and compute total
  const items = cart.items.map(i => ({
    product: i.product._id,
    title: i.product.title,
    variant: i.variant,
    qty: i.qty,
    price: i.priceAtAdd
  }));
  const totalAmount = items.reduce((s, it) => s + it.qty * it.price, 0);

  const order = new Order({
    user: req.user._id,
    items,
    shippingAddress,
    paymentMethod,
    totalAmount
  });
  await order.save();

  // note: stock deduction logic should happen when order is delivered or per your rule
  await Cart.findOneAndDelete({ user: req.user._id });

  // send confirmation (stub)
  res.json({ order });
};

exports.getOrdersForUser = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};

exports.getAllOrders = async (req, res) => {
  try {
    let { page = 1, limit = 10, status } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (status) {
      filter.status = status; // ex: ?status=Shipped
    }

    // Paginated + Filtered query
    const orders = await Order.find(filter)
      .populate("user", "firstName lastName email phone uniqId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count with filter
    const total = await Order.countDocuments(filter);

    res.json({
      page,
      limit,
      status: status || null,
      total,
      totalPages: Math.ceil(total / limit),
      orders
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};



exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status, trackingNumber } = req.body;
  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (status) order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  await order.save();
  res.json(order);
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate("user", "firstName lastName email phone uniqId")
      .populate("items.product");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch order" });
  }
};


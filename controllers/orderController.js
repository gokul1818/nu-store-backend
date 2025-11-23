const Order = require('../models/Order');
const Product = require("../models/Product");

exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const productId = item._id;
      const qty = item.qty;
      const selected = item.selectedOptions; // { size, color, sku, stock }

      // Fetch product from DB
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(400).json({ message: "Invalid product" });
      }

      // Find variant in DB
      const variant = product.variants.find(
        (v) =>
          v.size === selected.size &&
          v.color === selected.color &&
          v.sku === selected.sku
      );

      if (!variant) {
        return res.status(400).json({
          message: `Variant ${selected.size}/${selected.color} not found`
        });
      }

      // Check stock
      if (variant.stock < qty) {
        return res.status(400).json({
          message: `${product.title} (${variant.size}/${variant.color}) has only ${variant.stock} left`
        });
      }

      // Deduct stock
      variant.stock -= qty;
      await product.save();

      // Prepare order item
      orderItems.push({
        product: product._id,
        title: product.title,
        qty,
        variant: {
          size: variant.size,
          color: variant.color,
          sku: variant.sku,
        },
        images: product.images,
        price: product.price
      });

      totalAmount += product.price * qty;
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      totalAmount
    });

    await order.save();

    res.json({ message: "Order placed successfully", order });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create order", error: err.message });
  }
};


exports.getOrdersForUser = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    const filter = { user: req.user._id };

    // Fetch paginated orders
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count total orders for this user
    const total = await Order.countDocuments(filter);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      orders
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
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
  const { status, trackingNumber, trackingUrl } = req.body;
  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (status) order.status = status;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (trackingUrl) order.trackingUrl = trackingUrl;
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


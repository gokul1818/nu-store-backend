const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const orderConfirmedTemplate = require("../emails/orderConfirmed");
const orderStatusTemplate = require("../emails/orderStatusUpdate");

// ==========================
// CREATE ORDER
// ==========================
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    const user = await User.findById(req.user._id); // FIXED

    const orderItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const productId = item._id;
      const qty = item.qty;
      const selected = item.selectedOptions;

      // Fetch product
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(400).json({ message: "Invalid product" });
      }

      // Validate variant
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

      if (variant.stock < qty) {
        return res.status(400).json({
          message: `${product.title} (${variant.size}/${variant.color}) has only ${variant.stock} left`
        });
      }

      // Deduct stock
      variant.stock -= qty;
      await product.save();

      // Build order item
      orderItems.push({
        product: product._id,
        title: product.title,
        qty,
        variant: {
          size: variant.size,
          color: variant.color,
          sku: variant.sku
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

    // SEND EMAIL (FIXED)
    await sendEmail(
      user.email,
      "Order Confirmed ✔",
      orderConfirmedTemplate(order, user)
    );

    res.json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to create order", error: err.message });
  }
};

// ==========================
// GET USER ORDERS (PAGINATED)
// ==========================
exports.getOrdersForUser = async (req, res) => {
  try {
    let { page = 1, limit = 10 } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;
    const filter = { user: req.user._id };

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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

// ==========================
// ADMIN ALL ORDERS (PAGINATED)
// ==========================
exports.getAllOrders = async (req, res) => {
  try {
    let { page = 1, limit = 10, status } = req.query;

    const filter = {};
    if (status) filter.status = status;

    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const orders = await Order.find(filter)
      .populate("user", "firstName lastName email phone uniqId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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

// ==========================
// UPDATE ORDER STATUS
// ==========================
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, trackingUrl } = req.body;

    const order = await Order.findById(id).populate("user"); // FIXED populate user

    if (!order) return res.status(404).json({ message: "Order not found" });

    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (trackingUrl) order.trackingUrl = trackingUrl;

    await order.save();

    // SEND EMAIL (FIXED)
    await sendEmail(
      order.user.email,
      `Order Status Updated to: ${status}`,
      orderStatusTemplate(order, order.user)
    );

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to update order" });
  }
};

// ==========================
// ORDER BY ID
// ==========================
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "firstName lastName email phone uniqId")
      .populate("items.product");

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  title: String,
  variant: Object,
  qty: Number,
  price: Number,
  images: [String]
});

const OrderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [OrderItemSchema],
  shippingAddress: Object,
  paymentMethod: { type: String }, // UPI / card placeholder
  totalAmount: Number,
  status: {
    type: String,
    enum: ['Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Processing'
  },
  trackingNumber: String,
  trackingUrl: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', OrderSchema);

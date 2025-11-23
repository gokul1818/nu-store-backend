const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

exports.getAdminDashboard = async (req, res) => {
  try {
    // ----------------------------------------------------
    //  TOTAL SALES (exclude Cancelled)
    // ----------------------------------------------------
    const totalSalesAgg = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
    ]);

    const totalSales = totalSalesAgg[0]?.totalSales || 0;

    // ----------------------------------------------------
    //  TOTAL ORDERS / USERS
    // ----------------------------------------------------
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();

    const avgOrderValue =
      totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0;

    // ----------------------------------------------------
    //  MONTHLY REVENUE ANALYTICS
    // ----------------------------------------------------
    const revenueByMonth = await Order.aggregate([
      { $match: { status: { $ne: "Cancelled" } } },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$totalAmount" }
        }
      },
      { $sort: { "_id": 1 } }
    ]);

    const monthlyData = new Array(12).fill(0);
    revenueByMonth.forEach((m) => {
      monthlyData[m._id - 1] = m.total;
    });

    // ----------------------------------------------------
    //  LOW STOCK (BASED ON VARIANTS)
    // ----------------------------------------------------
    const lowStock = await Product.aggregate([
      { $unwind: "$variants" },
      { $match: { "variants.stock": { $lte: 5 } } },
      {
        $group: {
          _id: "$_id",
          title: { $first: "$title" },
          variants: {
            $push: {
              size: "$variants.size",
              color: "$variants.color",
              sku: "$variants.sku",
              stock: "$variants.stock"
            }
          }
        }
      },
      { $sort: { "variants.stock": 1 } }
    ]);

    // ----------------------------------------------------
    //  ORDER STATUS SUMMARY
    // ----------------------------------------------------
    const statusCounts = await Order.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const statusData = {
      Processing: 0,
      Packed: 0,
      Shipped: 0,
      Delivered: 0,
      Cancelled: 0
    };

    statusCounts.forEach((s) => {
      statusData[s._id] = s.count;
    });

    // ----------------------------------------------------
    //  BEST SELLING PRODUCTS
    // ----------------------------------------------------
    const bestSelling = await Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          totalSold: { $sum: "$items.qty" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },

      // JOIN product info
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "product"
        }
      },
      { $unwind: "$product" },
      {
        $project: {
          _id: 1,
          totalSold: 1,
          title: "$product.title",
          thumbnail: "$product.thumbnail"
        }
      }
    ]);

    // ----------------------------------------------------
    //  FINAL RESPONSE
    // ----------------------------------------------------
    res.json({
      totalSales,
      totalOrders,
      totalUsers,
      avgOrderValue,
      revenueAnalytics: monthlyData,
      lowStock,
      orderStatus: statusData,
      bestSelling
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");

exports.getAdminDashboard = async (req, res) => {
    try {
        const totalSalesAgg = await Order.aggregate([
            { $match: { status: { $ne: "Cancelled" } } },
            { $group: { _id: null, totalSales: { $sum: "$totalAmount" } } }
        ]);
        const totalSales = totalSalesAgg[0]?.totalSales || 0;
        const totalOrders = await Order.countDocuments();
        const totalUsers = await User.countDocuments();
        const avgOrderValue =
            totalOrders > 0 ? (totalSales / totalOrders).toFixed(2) : 0;
        const revenueByMonth = await Order.aggregate([
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    total: { $sum: "$totalAmount" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        const monthlyData = new Array(12).fill(0);
        revenueByMonth.forEach((item) => {
            monthlyData[item._id - 1] = item.total;
        });
        const lowStock = await Product.find(
            { stock: { $lte: 5 } },
            { title: 1, stock: 1 }
        ).sort({ stock: 1 });

        const statusCounts = await Order.aggregate([
            { $group: { _id: "$status", count: { $sum: 1 } } }
        ]);

        const statusData = {
            Processing: 0,
            Packed: 0,
            Shipped: 0,
            Delivered: 0,
            Cancelled: 0,
        };

        statusCounts.forEach((s) => {
            statusData[s._id] = s.count;
        });
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
                    image: "$product.image",
                }
            }
        ]);

        res.json({
            totalSales,
            totalOrders,
            totalUsers,
            avgOrderValue,
            revenueAnalytics: monthlyData,
            lowStock,
            orderStatus: statusData,
            bestSelling,
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};



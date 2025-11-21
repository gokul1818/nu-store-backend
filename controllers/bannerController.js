const Banner = require("../models/Banner");

// Create Banner
exports.createBanner = async (req, res) => {
    try {
      
        const { title, link, imageUrl } = req.body;

        const banner = new Banner({
            title,
            link,
            imageUrl: imageUrl,
        });

        await banner.save();

        res.json({ message: "Banner created", banner });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get all banners
exports.getBanners = async (req, res) => {
    try {
        const banners = await Banner.find().sort({ createdAt: -1 });
        res.json(banners);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete banner
exports.deleteBanner = async (req, res) => {
    try {
        await Banner.findByIdAndDelete(req.params.id);
        res.json({ message: "Banner deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update banner (optional)
exports.updateBanner = async (req, res) => {
    try {
        const { title, link, isActive, imageUrl } = req.body;

        const updateData = { title, link, isActive, imageUrl };


        const updated = await Banner.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get single banner by ID
exports.getBannerById = async (req, res) => {
  try {
    const { id } = req.params;

    const banner = await Banner.findById(id);

    if (!banner) {
      return res.status(404).json({ message: "Banner not found" });
    }

    res.json(banner);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

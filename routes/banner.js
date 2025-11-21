const express = require("express");
const router = express.Router();

const bannerController = require("../controllers/bannerController");

router.post("/", bannerController.createBanner);
router.get("/", bannerController.getBanners);
router.delete("/:id", bannerController.deleteBanner);
router.put("/:id", bannerController.updateBanner);
router.get("/:id", bannerController.getBannerById);

module.exports = router;

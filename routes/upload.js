const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadLocal");
const { uploadImageLocal } = require("../controllers/uploadController");

// Single image upload
router.post("/image", upload.single("image"), uploadImageLocal);

// Multiple images upload (if needed)
router.post("/images", upload.array("images", 5), uploadImageLocal);

module.exports = router;

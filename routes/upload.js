const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadLocalRender");
const { uploadImage } = require("../controllers/uploadController");

// SINGLE FILE (Field: file)
router.post("/image", upload.single("file"), uploadImage);

module.exports = router;

const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();

// Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  }
});

// accepts ONLY { file: FILE }
const upload = multer({ storage }).single("file");

// Upload endpoint
router.post("/image", upload, (req, res) => {
  if (!req.file)
    return res.status(400).json({ message: "No file uploaded" });

  res.json({
    url: `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
  });
});

module.exports = router;

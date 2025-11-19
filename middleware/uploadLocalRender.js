const multer = require("multer");
const fs = require("fs");
const path = require("path");

// Detect Render environment
const isRender = process.env.RENDER === "true";

// LOCAL upload folder
const localUploadPath = path.join(__dirname, "..", "uploads");

// Create uploads folder only for LOCAL environment
if (!isRender) {
  if (!fs.existsSync(localUploadPath)) {
    fs.mkdirSync(localUploadPath);
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (isRender) {
      cb(null, "/tmp"); // Render only
    } else {
      cb(null, localUploadPath); // Local only
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueName + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPG, PNG, WEBP allowed"), false);
};

module.exports = multer({ storage, fileFilter });

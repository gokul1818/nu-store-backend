exports.uploadImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const isRender = process.env.RENDER === "true";

  let url;

  if (isRender) {
    // Serve /tmp files using API
    url = `${req.protocol}://${req.get("host")}/api/upload/tmp/${req.file.filename}`;
  } else {
    // Local machine — serve from /uploads folder
    url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  }

  res.json({
    message: "Upload successful",
    filename: req.file.filename,
    url
  });
};

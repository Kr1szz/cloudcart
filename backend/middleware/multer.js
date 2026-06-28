const multer = require("multer");

// Configure memory storage to keep file buffers in memory for S3 uploading
const storage = multer.memoryStorage();

// File filter to allow only image uploads
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images (JPG, JPEG, PNG, WEBP) are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

module.exports = upload;

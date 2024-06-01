const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const fileUpload = multer({
  limits: { fileSize: 5e6 }, // converting 5 MB to bytes

  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mime type!");
    cb(error, isValid);
  },

  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/images"); // Set the destination directory
    },

    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      // Generate a unique filename using UUID and append the correct file extension
      const uniqueName = uuidv4() + "." + ext;
      cb(null, uniqueName);
    },
  }),
});

module.exports = fileUpload;

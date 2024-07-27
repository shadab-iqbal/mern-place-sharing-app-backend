const fs = require("fs");

function errorHandler(error, req, res, next) {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.error("Error deleting uploaded file:", err);
    });
  }

  // If the response has already been sent, forward the error to the next middleware
  if (res.headerSent) {
    return next(error);
  }

  res
    .status(error.statusCode || 500)
    .json({ message: error.message || "An unknown error occurred!" });
}

module.exports = errorHandler;

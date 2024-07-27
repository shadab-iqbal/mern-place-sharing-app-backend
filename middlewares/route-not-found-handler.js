const HttpError = require("../models/http-error");

function errorHandler(req, res, next) {
  const error = new HttpError("Could not find this route.", 404);
  next(error);
}

module.exports = errorHandler;

const jwt = require("jsonwebtoken");
const HttpError = require("../models/http-error");

const checkAuth = (req, res, next) => {
  // if (req.method === "OPTIONS") {
  //   return next();
  // }

  try {
    const token = req.headers.authorization.split(" ")[1]; // authorization: bearer {TOKEN}
    if (!token) {
      throw new Error();
    }
    const decryptedToken = jwt.verify(token, process.env.JWT_SECRET);
    req.userData = { userId: decryptedToken.userId };

    return next();
  } catch (err) {
    return next(new HttpError("Authentication failed!", 401));
  }
};

module.exports = checkAuth;

const express = require("express");
const { body } = require("express-validator");

const { getAllUsers, signup, login } = require("../controllers/users-controller");
const fileUpload = require("../middlewares/file-upload");

const usersRouter = express.Router();

usersRouter.route("/").get(getAllUsers);

usersRouter
  .route("/signup")
  .post(
    fileUpload.single("image"),
    [
      body("name").notEmpty(),
      body("email").normalizeEmail().isEmail(),
      body("password").isLength({ min: 6 }),
    ],
    signup
  );

// we dont need to validate the email and password here because it will be validated anyway for the login
usersRouter.route("/login").post(login);

module.exports = usersRouter;

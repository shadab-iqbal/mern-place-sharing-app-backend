const { validationResult } = require("express-validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const User = require("../models/users-model");

const getAllUsers = async (req, res, next) => {
  let allUsers;

  try {
    allUsers = await User.find({}, "-password").exec();
  } catch (err) {
    return next(new HttpError("Fetching users failed, please try again later.", 500));
  }

  res.json({ users: allUsers.map((user) => user.toObject({ getters: true })) });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs passed, please check your data.", 422));
  }

  const { name, email, password } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError("Could not create user, please try again.", 500));
  }

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    image: req.file.path,
    places: [],
  });

  const session = await mongoose.startSession();
  session.startTransaction();

  let token;

  try {
    await newUser.save({ session });

    token = jwt.sign({ userId: newUser.id, email: newUser.email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    await session.commitTransaction();
    await session.endSession();
  } catch (err) {
    await session.abortTransaction();
    await session.endSession();

    if (err.code === 11000) {
      return next(new HttpError("Email already exists, please login instead.", 422));
    }
    return next(new HttpError("Signing up failed, please try again later.", 500));
  }

  res.status(201).json({ userId: newUser.id, token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let loggedInUser;

  try {
    loggedInUser = await User.findOne({ email }).exec();
  } catch (err) {
    return next(new HttpError("Logging in failed, please try again later.", 500));
  }

  if (!loggedInUser) {
    return next(new HttpError("Could not identify user, credentials seem to be wrong.", 401));
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, loggedInUser.password);
  } catch (err) {
    return next(new HttpError("Logging in failed, please try again later.", 500));
  }

  if (!isValidPassword) {
    return next(new HttpError("Could not identify user, credentials seem to be wrong.", 401));
  }

  let token;
  try {
    token = jwt.sign(
      { userId: loggedInUser.id, email: loggedInUser.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
  } catch (err) {
    return next(new HttpError("Logging in failed, please try again later.", 500));
  }

  res.json({ message: "Logged in!", userId: loggedInUser.id, token });
};

module.exports = {
  getAllUsers,
  signup,
  login,
};

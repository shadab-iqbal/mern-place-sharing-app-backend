const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const fs = require("fs");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../utils/location");
const Place = require("../models/places-model");
const User = require("../models/users-model");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let placeWithCreator;

  try {
    placeWithCreator = await Place.findById(placeId).populate("creator").exec();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Something went wrong, could not find a place.", 500);
    return next(error);
  }

  if (!placeWithCreator) {
    return next(new HttpError("Could not find a place for the provided id.", 404));
  }

  res.json({ place: placeWithCreator.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let foundPlaces;

  try {
    const foundUser = await User.findById(userId).populate("places").exec();
    foundPlaces = foundUser.places;
  } catch (err) {
    console.log(err);
    const error = new HttpError("Fetching places failed, please try again later.", 500);
    return next(error);
  }

  if (foundPlaces.length === 0) {
    const error = new HttpError("Could not find places for the provided user id.", 404);
    return next(error);
  }

  res.json({ places: foundPlaces.map((place) => place.toObject({ getters: true })) });
};

const createNewPlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs passed, please check your data.", 422));
  }

  const { title, description, address } = req.body;

  const newPlace = new Place({
    title,
    description,
    image: req.file.path,
    location: getCoordsForAddress(address),
    address,
  });

  let user;
  const creator = req.userData.userId;

  try {
    user = await User.findById(creator).exec();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Creating place failed, please try again.", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  try {
    // creating a session to perform multiple operations
    const sess = await mongoose.startSession();
    sess.startTransaction();

    // saving the place with the user id
    newPlace.creator = user.id;
    await newPlace.save({ session: sess });

    // adding the place id to the user's places array
    user.places.push(newPlace.id);
    await user.save({ session: sess });

    // committing the transaction
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Creating place failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json({ place: newPlace });
};

const updatePlaceById = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new HttpError("Invalid inputs passed, please check your data.", 422));
  }

  const placeId = req.params.pid;
  const { title, description } = req.body;

  let place;
  try {
    place = await Place.findById(placeId).exec();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Something went wrong, could not update place.", 500);
    return next(error);
  }

  if (!place) {
    return next(new HttpError("Could not find place for this id.", 404));
  }

  // Check if the logged-in user is the creator of the place
  if (place.creator.toString() !== req.userData.userId) {
    return next(new HttpError("You are not allowed to edit this place.", 403));
  }

  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Something went wrong, could not update place.", 500);
    return next(error);
  }

  res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let placeWithCreator;

  try {
    placeWithCreator = await Place.findById(placeId).populate("creator").exec();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Something went wrong, could not delete place.", 500);
    return next(error);
  }

  if (!placeWithCreator) {
    return next(new HttpError("Could not find place for this id.", 404));
  }

  // Check if the logged-in user is the creator of the place
  if (placeWithCreator.creator.id.toString() !== req.userData.userId) {
    return next(new HttpError("You are not allowed to delete this place.", 403));
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();

    await placeWithCreator.deleteOne({ session: sess });

    placeWithCreator.creator.places.pull(placeWithCreator.id);
    await placeWithCreator.creator.save({ session: sess });

    await sess.commitTransaction();

    fs.unlink(placeWithCreator.image, (err) => {
      console.log(err);
    });
  } catch (err) {
    console.log(err);
    const error = new HttpError("Something went wrong, could not delete place.", 500);
    return next(error);
  }

  res.status(200).json({ message: "Successfully deleted place" });
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createNewPlace,
  updatePlaceById,
  deletePlaceById,
};

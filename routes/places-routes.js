const express = require("express");
const { body } = require("express-validator");

const {
  getPlaceById,
  getPlacesByUserId,
  createNewPlace,
  updatePlaceById,
  deletePlaceById,
} = require("../controllers/places-controller");
const fileUpload = require("../middlewares/file-upload");
const checkAuth = require("../middlewares/check-auth");

const router = express.Router();

router
  .route("/")
  .post(
    checkAuth,
    fileUpload.single("image"),
    [
      body("title").notEmpty(),
      body("description").isLength({ min: 5 }),
      body("address").notEmpty(),
    ],
    createNewPlace
  );

router
  .route("/:pid")
  .get(getPlaceById)
  .patch(
    checkAuth,
    [body("title").notEmpty(), body("description").isLength({ min: 5 })],
    updatePlaceById
  )
  .delete(checkAuth, deletePlaceById);

router.route("/user/:uid").get(getPlacesByUserId);

module.exports = router;

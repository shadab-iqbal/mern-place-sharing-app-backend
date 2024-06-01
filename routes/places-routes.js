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

router.get("/:pid", getPlaceById);

router.get("/user/:uid", getPlacesByUserId);

router.use(checkAuth);

router.post(
  "/",
  fileUpload.single("image"),
  [body("title").notEmpty(), body("description").isLength({ min: 5 }), body("address").notEmpty()],
  createNewPlace
);

router.patch(
  "/:pid",
  [body("title").notEmpty(), body("description").isLength({ min: 5 })],
  updatePlaceById
);

router.delete("/:pid", deletePlaceById);

module.exports = router;

const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const placesRouter = require("./routes/places-routes");
const usersRouter = require("./routes/users-routes");
const errorHandler = require("./middlewares/error-handler");
const routeNotFoundHandler = require("./middlewares/route-not-found-handler");

const app = express();

// using Morgan middleware for dev logging
app.use(morgan("dev"));

// using CORS, JSON and urlencoded middlewares
app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

// serve static files from the "uploads/images" folder
app.use("/assets/uploads/images", express.static(path.join(__dirname, "uploads", "images")));

// handing the routes for Places and Users resources
app.use("/api/places", placesRouter);
app.use("/api/users", usersRouter);

// this middleware will only be reached if no previous middlewares sent a res.json() response
app.use(routeNotFoundHandler);

// this middleware will be executed for any request that has an error attached to it by the other above middlewares
app.use(errorHandler);

module.exports = app;

const path = require("path");
const express = require("express");
const cors = require("cors");

const connectDB = require("./db");
const placesRouter = require("./routes/places-routes");
const usersRouter = require("./routes/users-routes");
const errorHandler = require("./middlewares/error-handler");
const routeNotFoundHandler = require("./middlewares/route-not-found-handler");

const app = express();

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

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(process.env.PORT || 5001, () => {
    console.log(`Server running on port ${process.env.PORT || 5001}`);
    console.log("------------");
  });
});

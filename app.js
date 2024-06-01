const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();

app.use(cors());
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use("/assets/uploads/images", express.static(path.join(__dirname, "uploads", "images")));

app.use("/api/places", placesRoutes); // => /api/places/...
app.use("/api/users", usersRoutes); // => /api/users/...

// this middleware will only be reached if no previous middlewares sent a res.json() response
app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  next(error);
});

// this middleware will be executed for any request that has
// an error attached to it by the other above middlewares
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }

  // If the response has already been sent, forward the error to the next middleware
  if (res.headerSent) {
    return next(error);
  }

  res
    .status(error.statusCode || 500)
    .json({ message: error.message || "An unknown error occurred!" });
});

console.log("------------\nConnecting to MongoDB Atlas Database...");
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.sg6gbts.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`
  )
  .then(() => {
    app.listen(process.env.PORT || 5001);
    console.log("Application started successfully!\n------------");
  })
  .catch((err) => {
    console.log("Database Connection Error\n", err);
  });

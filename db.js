const mongoose = require("mongoose");

async function connectDB() {
  console.log("------------");
  console.log("Connecting to MongoDB Atlas Database...");
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.sg6gbts.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`
    );
    console.log("MongoDB Atlas connected successfully!");
  } catch (error) {
    console.error("MongoDB Atlas connection error:", error);
    process.exit(1); // Exit process with failure
  }
}

module.exports = connectDB;

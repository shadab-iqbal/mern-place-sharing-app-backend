const app = require("./app");
const connectDB = require("./db");

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(process.env.PORT || 5001, () => {
    console.log(`Server running on port ${process.env.PORT || 5001}`);
    console.log("------------");
  });
});

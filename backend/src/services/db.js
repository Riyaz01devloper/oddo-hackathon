const mongoose = require("mongoose");

const connectDb = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Error connecting to database:", err.message);
    process.exit(1);
  }
};

module.exports = connectDb;
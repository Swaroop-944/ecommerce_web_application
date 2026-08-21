const mongoose = require("mongoose");

async function connectDB() {
  try {
    if (!process.env.MONGO_URI || process.env.MONGO_URI.includes("<db_password>")) {
      throw new Error("MONGO_URI must contain the actual MongoDB password");
    }

    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

module.exports = connectDB;

const mongoose = require("mongoose");

const connectDatabase = async () => {
  console.log("process.env.MONGO_URL", process.env.MONGO_URL);
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("database connected successfully..");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
};

module.exports = connectDatabase;

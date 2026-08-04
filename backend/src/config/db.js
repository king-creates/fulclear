const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log("MONGO_URI:", process.env.MONGO_URI);
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Atlas connected: ${conn.connection.host}`);
  } catch (error) {
    // console.error(`❌ MongoDB connection failed: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
};

module.exports = connectDB;
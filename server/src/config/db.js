const mongoose = require('mongoose');
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-translation-workspace';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    global.useMockDb = false;
  } catch (error) {
    console.warn(`[WARNING] MongoDB connection failed: ${error.message}`);
    console.warn(`[WARNING] Falling back to In-Memory mock database. All data will be reset on server restart.`);
    global.useMockDb = true;
  }
};

module.exports = connectDB;


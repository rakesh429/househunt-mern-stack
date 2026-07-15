const mongoose = require('mongoose');

const connectDB = async () => {
  // Disable query buffering so that operations fail fast instead of hanging when DB is offline
  mongoose.set('bufferCommands', false);

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/househunt', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 3000, // Timeout after 3s instead of 30s
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('================================================================');
    console.error('DATABASE CONNECTION ERROR: Connect to MongoDB failed!');
    console.error('Please make sure your local MongoDB service is running, or');
    console.error('update MONGO_URI in your backend/.env to your MongoDB Atlas link.');
    console.error('================================================================');
  }
};

module.exports = connectDB;

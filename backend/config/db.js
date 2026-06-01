const mongoose = require('mongoose');

let cachedConnection = null;

const connectDB = async () => {
  // If already connected, reuse the existing connection
  if (cachedConnection && mongoose.connection.readyState >= 1) {
    return cachedConnection;
  }

  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tracker';
  const isAtlas = mongoUri.includes('mongodb+srv://');
  const isVercel = !!process.env.VERCEL;
  
  console.log(`Attempting connection to MongoDB... (Atlas: ${isAtlas}, Vercel: ${isVercel})`);
  
  const options = {
    serverSelectionTimeoutMS: isAtlas ? 15000 : 3000,
    bufferCommands: false, // Fail immediately if not connected instead of buffering
  };

  try {
    const conn = await mongoose.connect(mongoUri, options);
    cachedConnection = conn;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    // On Vercel/production, never try in-memory fallback — it won't work in serverless
    if (isAtlas || isVercel) {
      console.error(`MongoDB Atlas Connection Failed: ${err.message}`);
      throw err;
    }

    // Local development only: fallback to in-memory MongoDB
    console.log('Local MongoDB not found. Starting In-Memory MongoDB Server...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      
      console.log(`In-Memory MongoDB Server running at: ${inMemoryUri}`);
      const conn = await mongoose.connect(inMemoryUri);
      cachedConnection = conn;
      console.log(`MongoDB Connected (In-Memory Fallback): ${conn.connection.host}`);
      return conn;
    } catch (memErr) {
      console.error(`In-Memory MongoDB also failed: ${memErr.message}`);
      throw memErr;
    }
  }
};

module.exports = connectDB;

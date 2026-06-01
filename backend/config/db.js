const mongoose = require('mongoose');

const connectDB = async () => {
  // If already connected, use the existing connection
  if (mongoose.connection.readyState >= 1) {
    console.log('MongoDB: Using existing database connection');
    return;
  }

  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/tracker';
    const isAtlas = mongoUri.includes('mongodb+srv://');
    
    console.log(`Attempting connection to MongoDB...`);
    
    // 15 seconds timeout for Atlas DNS/SSL handshake, 3 seconds for local check
    const options = {
      serverSelectionTimeoutMS: isAtlas ? 15000 : 3000
    };

    try {
      const conn = await mongoose.connect(mongoUri, options);
      console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (localErr) {
      if (isAtlas) {
        // Fail loudly for Atlas so the user knows if credentials or IP whitelist are incorrect
        throw new Error(`Failed to connect to MongoDB Atlas. Error: ${localErr.message}`);
      }

      console.log('Local MongoDB service not found. Starting dynamic In-Memory MongoDB Server...');
      
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const inMemoryUri = mongoServer.getUri();
      
      console.log(`In-Memory MongoDB Server running at: ${inMemoryUri}`);
      const conn = await mongoose.connect(inMemoryUri);
      console.log(`MongoDB Connected (In-Memory Fallback): ${conn.connection.host}`);
    }
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

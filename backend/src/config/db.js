const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/crp_india';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`[DB] Connected to MongoDB: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.warn(`[DB] Could not connect to primary MongoDB instance: ${err.message}`);
    
    // In development or test environments, fallback gracefully to in-memory MongoDB
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log('[DB] Initializing embedded in-memory MongoDB for seamless development...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`[DB] Connected to In-Memory MongoDB at ${memUri}`);
        return conn;
      } catch (memErr) {
        console.error('[DB] Failed to initialize in-memory fallback:', memErr.message);
      }
    }

    console.error('[DB] Fatal Database Connection Error. Ensure MongoDB is running.');
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongod) {
      await mongod.stop();
    }
    console.log('[DB] Disconnected from MongoDB');
  } catch (err) {
    console.error('[DB] Error during disconnect:', err.message);
  }
};

module.exports = { connectDB, disconnectDB };
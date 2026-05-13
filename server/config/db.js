const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// ─── Persisted reference so we never create a second MongoMemoryServer ───────
let mongodInstance = null;

/**
 * Build and return the embedded MongoDB URI.
 * Reuses the existing instance if one is already running.
 */
const getEmbeddedUri = async () => {
  if (mongodInstance) {
    return mongodInstance.getUri();
  }

  const { MongoMemoryServer } = require('mongodb-memory-server');

  const dbDir = path.join(__dirname, '..', 'data', 'db');
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  mongodInstance = await MongoMemoryServer.create({
    instance: {
      dbPath: dbDir,
      storageEngine: 'wiredTiger'
    }
  });

  return mongodInstance.getUri();
};

/**
 * Connect (or reconnect) to MongoDB.
 * Tries the URI from .env first; falls back to an embedded instance.
 */
const connectDB = async () => {
  try {
    // ── Try the configured URI ──────────────────────────────────────────────
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.log('⚠️  Local MongoDB not found. Starting embedded database...');
    try {
      const uri = await getEmbeddedUri();
      await mongoose.connect(uri);
      console.log(`✅ Embedded MongoDB Connected: ${mongoose.connection.host}`);
      console.log('   💾 Data will be persistently stored at: server/data/db');
    } catch (memError) {
      console.error(`❌ Embedded MongoDB Connection Error: ${memError.message}`);
      process.exit(1);
    }
  }

  // ── Attach event listeners only once ────────────────────────────────────
  mongoose.connection.removeAllListeners('disconnected');
  mongoose.connection.removeAllListeners('error');

  mongoose.connection.on('disconnected', async () => {
    console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
    try {
      let uri = process.env.MONGODB_URI;
      // If we're using the embedded server, get its URI
      if (mongodInstance) {
        uri = mongodInstance.getUri();
      }
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
      console.log('✅ MongoDB reconnected.');
    } catch (e) {
      console.error('❌ Reconnection failed:', e.message);
    }
  });

  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err.message);
  });
};

module.exports = connectDB;

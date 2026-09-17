const mongoose = require('mongoose');

let isConnected = false;
let connectionError = null;
let lastPingMs = null;

const DEFAULT_MONGO_URI = 'mongodb+srv://vinaysingh639042_db_user:eGa1OXL2FZ7BOdx4@cluster0.asiaecy.mongodb.net/library_management?retryWrites=true&w=majority&appName=Cluster0';

async function connectMongo(customUri = null) {
  const uri = customUri || process.env.MONGODB_URI || DEFAULT_MONGO_URI;
  
  if (mongoose.connection.readyState === 1) {
    isConnected = true;
    return mongoose.connection;
  }

  try {
    mongoose.set('strictQuery', false);
    
    // Listen for state transitions
    mongoose.connection.on('connected', () => {
      isConnected = true;
      connectionError = null;
      console.log('🍃 MongoDB Connected successfully to:', uri.replace(/:([^:@]+)@/, ':****@'));
    });

    mongoose.connection.on('error', (err) => {
      isConnected = false;
      connectionError = err.message;
      console.warn('⚠️ MongoDB connection warning:', err.message);
    });

    mongoose.connection.on('disconnected', () => {
      isConnected = false;
      console.log('🔌 MongoDB Disconnected');
    });

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 8000,
      family: 4
    });

    isConnected = true;
    connectionError = null;
    return conn;
  } catch (err) {
    isConnected = false;
    connectionError = err.message;
    console.warn(`⚠️ Could not connect to MongoDB (${err.message}). Database operations will fallback seamlessly.`);
    return null;
  }
}

async function getMongoStatus() {
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized'
  };

  const readyState = mongoose.connection.readyState;
  let latency = null;
  let collections = [];

  if (readyState === 1 && mongoose.connection.db) {
    try {
      const start = Date.now();
      await mongoose.connection.db.admin().ping();
      latency = Date.now() - start;
      lastPingMs = latency;
      
      const colList = await mongoose.connection.db.listCollections().toArray();
      collections = colList.map(c => c.name);
    } catch (e) {
      latency = null;
    }
  }

  const rawUri = process.env.MONGODB_URI || DEFAULT_MONGO_URI;
  const maskedUri = rawUri.replace(/:([^:@]+)@/, ':****@');

  return {
    is_connected: readyState === 1,
    state: stateMap[readyState] || 'unknown',
    uri: maskedUri,
    database_name: mongoose.connection.name || 'library_management',
    host: mongoose.connection.host || 'localhost',
    port: mongoose.connection.port || 27017,
    latency_ms: latency,
    collections_count: collections.length,
    collections,
    last_error: connectionError
  };
}

module.exports = {
  mongoose,
  connectMongo,
  getMongoStatus,
  getIsConnected: () => isConnected
};

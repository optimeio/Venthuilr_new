import mongoose from 'mongoose';
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch (e) {
  // Ignore in environments where setServers is unsupported
}

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://mentorixacademyma_db_user:LneWJGHjYKSDUCO1@cluster0.hnxrmlo.mongodb.net/ecomVen?retryWrites=true&w=majority&appName=Cluster0';

if (!MONGO_URI) {
  throw new Error('Please define the MONGO_URI environment variable inside .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot-reloads in development.
 * This prevents connections growing exponentially during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGO_URI, opts).then((mongooseInstance) => {
      console.log('🌿 Royal Venthulir Database Connected (Next.js Fullstack)');
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('❌ Database Connection Error:', e);
    throw e;
  }

  return cached.conn;
}

export default connectDB;

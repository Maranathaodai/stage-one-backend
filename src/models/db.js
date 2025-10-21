const { MongoClient, ServerApiVersion } = require('mongodb');
let MongoMemoryServer;
try {
  ({ MongoMemoryServer } = require('mongodb-memory-server'));
} catch (e) {
}

const useMemory = String(process.env.MONGODB_USE_MEMORY || '').toLowerCase() === 'true';
const tlsInsecure = String(process.env.MONGODB_TLS_INSECURE || '').toLowerCase() === 'true';
const defaultUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/string_analyzer';

let db;
let client;
let memServer;

async function connectDB() {
  if (db) return db;

  if (useMemory) {
    if (!MongoMemoryServer) {
      throw new Error('mongodb-memory-server is not installed. Run: npm install mongodb-memory-server --save-dev');
    }
    memServer = await MongoMemoryServer.create();
    const memUri = memServer.getUri();
    client = new MongoClient(memUri, {
      serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
    });
    await client.connect();
    db = client.db();
    console.log('Connected to in-memory MongoDB');
    return db;
  }

  client = new MongoClient(defaultUri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true },
    tlsAllowInvalidCertificates: tlsInsecure,
    tlsAllowInvalidHostnames: tlsInsecure,
    serverSelectionTimeoutMS: 20000,
    connectTimeoutMS: 20000,
    socketTimeoutMS: 45000,
  });
  await client.connect();
  db = client.db();
  console.log('Connected to MongoDB');
  if (tlsInsecure) {
    console.warn('WARNING: MONGODB_TLS_INSECURE=true (TLS cert validation is disabled). Do not use in production.');
  }
  return db;
}

module.exports = { connectDB };

// api/_db.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

if (!uri) {
  throw new Error('MONGO_URI is not defined');
}
if (!dbName) {
  throw new Error('DB_NAME is not defined');
}

let client;
let clientPromise;

// Reuse the same client between invocations (important on Vercel)
if (!global._mongoClientPromise) {
  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    // These TLS options help with the SSL error you're seeing
    tls: true,
    tlsAllowInvalidCertificates: true
  });
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

async function getDB() {
  const c = await clientPromise;
  return c.db(dbName);
}

module.exports = getDB;

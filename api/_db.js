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

// Reuse same client between invocations in Vercel
if (!global._mongoClientPromise) {
  client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
    tls: true,
    tlsAllowInvalidCertificates: true, // ok for this project, removes TLS headache
  });
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

async function getDB() {
  const c = await clientPromise;
  return c.db(dbName);
}

module.exports = getDB;

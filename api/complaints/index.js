// api/complaints/index.js
const { MongoClient } = require('mongodb');

let client;

async function getDB() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
  }
  return client.db(process.env.DB_NAME);
}

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
    // CORS preflight
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  try {
    const db = await getDB();

    // Parse body manually
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      const data = JSON.parse(body || '{}');
      data.createdAt = new Date();

      const result = await db.collection('complaints').insertOne(data);

      res.statusCode = 201;
      res.end(JSON.stringify({ _id: result.insertedId, ...data }));
    });
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: 'Server error' }));
  }
};

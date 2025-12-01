// api/complaints/index.js
const getDB = require('../../_db');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') {
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

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', async () => {
      const data = JSON.parse(body || '{}');
      data.dateFiled = new Date();
      data.status = data.status || 'pending';

      const result = await db.collection('complaints').insertOne(data);

      res.statusCode = 201;
      res.end(JSON.stringify({ _id: result.insertedId, ...data }));
    });
  } catch (err) {
    console.error('Error in /api/complaints:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: 'Server error', error: err.message }));
  }
};

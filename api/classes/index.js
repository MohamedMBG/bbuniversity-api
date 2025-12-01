// api/classes/index.js
const getDB = require('../_db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method === 'POST') {
    try {
      const db = await getDB();

      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', async () => {
        const data = JSON.parse(body || '{}');

        const name = data.name;
        if (!name) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ message: 'name is required' }));
        }

        // on utilise le nom comme _id (comme dans ton Firestore)
        if (!data._id) data._id = name;

        const result = await db.collection('classes').insertOne(data);

        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 201;
        return res.end(JSON.stringify({
          _id: result.insertedId,
          ...data
        }));
      });
    } catch (err) {
      console.error('Error in POST /api/classes:', err);
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: 'Server error', error: err.message }));
    }
  } else {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }
};

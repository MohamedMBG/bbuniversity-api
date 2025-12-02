// api/users/index.js
const getDB = require('../../_db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  // ----------- GET /api/users?role=professor -----------
  if (req.method === 'GET') {
    try {
      const db = await getDB();

      const { role } = req.query || {};
      const filter = {};

      // si ?role=professor est passé, on filtre
      if (role) {
        filter.role = role;
      }

      const users = await db.collection('users').find(filter).toArray();

      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      return res.end(JSON.stringify(users));
    } catch (err) {
      console.error('Error in GET /api/users:', err);
      res.statusCode = 500;
      return res.end(JSON.stringify({
        message: 'Server error',
        error: err.message
      }));
    }
  }

  // ----------- POST /api/users -----------
  if (req.method === 'POST') {
    try {
      const db = await getDB();

      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', async () => {
        const data = JSON.parse(body || '{}');

        // ✅ Si uid est présent, on l'utilise comme _id (pour matcher Firebase UID)
        if (data.uid && !data._id) {
          data._id = data.uid;
        }

        data.createdAt = new Date();

        const result = await db.collection('users').insertOne(data);

        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 201;
        return res.end(JSON.stringify({
          _id: result.insertedId,
          ...data
        }));
      });
    } catch (err) {
      console.error('Error in POST /api/users:', err);
      res.statusCode = 500;
      return res.end(JSON.stringify({
        message: 'Server error',
        error: err.message
      }));
    }
  } else {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }
};

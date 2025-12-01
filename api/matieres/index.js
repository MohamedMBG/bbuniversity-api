// api/matieres/index.js
const getDB = require('../../_db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const db = await getDB();

  if (req.method === 'GET') {
    try {
      const matieres = await db.collection('matieres').find({}).toArray();
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      return res.end(JSON.stringify(matieres));
    } catch (err) {
      console.error('Error in GET /api/matieres:', err);
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: 'Server error', error: err.message }));
    }
  }

  if (req.method === 'POST') {
    try {
      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', async () => {
        const data = JSON.parse(body || '{}');

        const nom = data.nom;
        if (!nom) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ message: 'nom is required' }));
        }

        // simple : on met _id = nom pour l’instant
        if (!data._id) data._id = nom;

        const result = await db.collection('matieres').insertOne(data);

        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 201;
        return res.end(JSON.stringify({
          _id: result.insertedId,
          ...data
        }));
      });
    } catch (err) {
      console.error('Error in POST /api/matieres:', err);
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: 'Server error', error: err.message }));
    }
  } else {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }
};

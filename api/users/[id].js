// api/users/[id].js
const getDB = require('../../_db');
const { ObjectId } = require('mongodb');

module.exports = async (req, res) => {
  const { id } = req.query;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  // ---------- GET USER ----------
  if (req.method === 'GET') {
    try {
      const db = await getDB();

      // on construit un OR sur _id, uid, email
      const orClauses = [
        { _id: id },
        { uid: id },
        { email: id }
      ];

      // si jamais tu as des users avec ObjectId(_id)
      if (/^[0-9a-fA-F]{24}$/.test(id)) {
        orClauses.push({ _id: new ObjectId(id) });
      }

      const user = await db.collection('users').findOne({
        $or: orClauses
      });

      if (!user) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ message: 'User not found', id }));
      }

      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      return res.end(JSON.stringify(user));
    } catch (err) {
      console.error('Error in GET /api/users/[id]:', err);
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: 'Server error', error: err.message }));
    }
  }

  // ---------- UPDATE USER ----------
  if (req.method === 'PUT') {
    try {
      const db = await getDB();

      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', async () => {
        const updates = JSON.parse(body || '{}');
        delete updates._id; // on ne change jamais l'_id

        const orClauses = [
          { _id: id },
          { uid: id },
          { email: id }
        ];
        if (/^[0-9a-fA-F]{24}$/.test(id)) {
          orClauses.push({ _id: new ObjectId(id) });
        }

        const result = await db.collection('users').updateOne(
          { $or: orClauses },
          { $set: updates }
        );

        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        return res.end(JSON.stringify({
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount
        }));
      });
    } catch (err) {
      console.error('Error in PUT /api/users/[id]:', err);
      res.statusCode = 500;
      return res.end(JSON.stringify({ message: 'Server error', error: err.message }));
    }
    return;
  }

  res.statusCode = 405;
  return res.end('Method Not Allowed');
};

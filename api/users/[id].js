// api/users/[id].js
const getDB = require('../../_db');

module.exports = async (req, res) => {
  const { id } = req.query;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method === 'GET') {
    try {
      const db = await getDB();
      const user = await db.collection('users').findOne({ _id: id });

      if (!user) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ message: 'User not found' }));
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

  if (req.method === 'PUT') {
    try {
      const db = await getDB();

      let body = '';
      req.on('data', chunk => { body += chunk.toString(); });
      req.on('end', async () => {
        const updates = JSON.parse(body || '{}');

        // on ne laisse pas changer _id
        delete updates._id;

        const result = await db.collection('users').updateOne(
          { _id: id },
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
  } else {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }
};

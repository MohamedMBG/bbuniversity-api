// api/users/[id].js
const getDB = require('../_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  try {
    const db = await getDB();
    const { id } = req.query;

    const user = await db.collection('users').findOne({ _id: id });

    if (!user) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ message: 'User not found' }));
    }

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(user));
  } catch (err) {
    console.error('Error in /api/users/[id]:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: 'Server error', error: err.message }));
  }
};

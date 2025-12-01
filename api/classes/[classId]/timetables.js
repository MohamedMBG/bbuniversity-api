const getDB = require('../../_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  try {
    const db = await getDB();
    const { classId } = req.query;

    const timetables = await db
      .collection('timetables')
      .find({ classId })
      .toArray();

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(timetables));
  } catch (err) {
    console.error('Error in /api/classes/[classId]/timetables:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: 'Server error', error: err.message }));
  }
};

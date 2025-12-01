// api/classes/[classId]/timetables.js
const getDB = require('../../../_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  try {
    const db = await getDB();
    const { classId } = req.query;

    const timetable = await db
      .collection('timetables')
      .findOne({ _id: classId });

    if (!timetable) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ message: 'No timetable found' }));
    }

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(timetable));
  } catch (err) {
    console.error('Error in /api/classes/[classId]/timetables:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: 'Server error', error: err.message }));
  }
};

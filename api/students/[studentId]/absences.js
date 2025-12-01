const getDB = require('../../_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  try {
    const db = await getDB();
    const { studentId } = req.query;

    const absences = await db
      .collection('absences')
      .find({ studentId })
      .toArray();

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(absences));
  } catch (err) {
    console.error('Error in /api/students/[studentId]/absences:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: 'Server error', error: err.message }));
  }
};

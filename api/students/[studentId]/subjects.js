// api/students/[studentId]/subjects.js
const getDB = require('../../_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  try {
    const db = await getDB();
    const { studentId } = req.query;

    const subjects = await db
      .collection('student_subjects')
      .find({ studentId })
      .toArray();

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(subjects));
  } catch (err) {
    console.error('Error in /api/students/[studentId]/subjects:', err);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: 'Server error', error: err.message }));
  }
};

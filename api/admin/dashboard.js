// api/admin/dashboard.js
const getDB = require('../../_db');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  try {
    const db = await getDB();

    // On fait tout en parallèle
    const [
      totalStudents,
      totalTeachers,
      totalAbsences,
      recentNotes
    ] = await Promise.all([
      db.collection('users').countDocuments({ role: 'student' }),
      db.collection('users').countDocuments({ role: 'professor' }),
      db.collection('absences').countDocuments({}),
      db.collection('notes')    
        .find({})
        .sort({ lastUpdate: -1 })
        .limit(3)
        .toArray()
    ]);

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    return res.end(JSON.stringify({
      totalStudents,
      totalTeachers,
      totalAbsences,
      recentNotes
    }));
  } catch (err) {
    console.error('Error in GET /api/admin/dashboard:', err);
    res.statusCode = 500;
    return res.end(JSON.stringify({ message: 'Server error', error: err.message }));
  }
};

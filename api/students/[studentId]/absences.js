// api/students/[studentId]/absences.js
const getDB = require('../../_db');   // ⬅ IMPORTANT: 2x ".." (pas 3)

/**
 * GET /api/students/:studentId/absences
 */
module.exports = async (req, res) => {
  // Preflight CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 204;
    return res.end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: 'Method not allowed' }));
  }

  try {
    const { studentId } = req.query;

    if (!studentId) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'studentId manquant dans l’URL' }));
    }

    const db = await getDB();

    // ⚠ adapte "absences" et "studentId" aux noms de TA collection / champ
    const absences = await db
      .collection('absences')
      .find({ studentId })   // ex: { studentId: "uidFirebase..." }
      .sort({ date: -1 })
      .toArray();

    res.statusCode = 200;
    return res.end(JSON.stringify(absences));
  } catch (err) {
    console.error('GET /api/students/[studentId]/absences error:', err);
    res.statusCode = 500;
    return res.end(
      JSON.stringify({ error: 'Server error', details: err.message })
    );
  }
};

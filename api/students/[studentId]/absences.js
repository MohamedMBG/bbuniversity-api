// api/students/[studentId]/absences.js
const getDB = require('../../_db'); // depuis /api/students/...

module.exports = async (req, res) => {
  // CORS basique (optionnel mais propre)
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDB();

    // Vercel : [studentId] vient dans req.query.studentId
    const { studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({ error: 'studentId manquant dans l’URL' });
    }

    // ⚠️ Assure-toi que tes docs absences ont bien un champ studentId
    const absences = await db
      .collection('absences')
      .find({ studentId })
      .sort({ date: -1 }) // les plus récentes d’abord
      .toArray();

    return res.status(200).json(absences);
  } catch (err) {
    console.error('Error in GET /api/students/[studentId]/absences:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

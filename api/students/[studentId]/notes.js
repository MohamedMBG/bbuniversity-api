// api/students/[studentId]/notes.js
const getDB = require('../../_db');

module.exports = async (req, res) => {
  // CORS basique
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

    // Vercel injecte [studentId] dans req.query.studentId
    const { studentId } = req.query;

    if (!studentId) {
      return res.status(400).json({ error: 'studentId manquant dans l’URL' });
    }

    // ⚠ Ici on suppose que dans la collection "notes",
    // tu as bien un champ "studentId" qui contient la même valeur
    // que celle envoyée par Android (uid ou email, mais cohérent partout).
    const notes = await db
      .collection('notes')
      .find({ studentId })
      .sort({ derniereMiseAJour: -1 })
      .toArray();

    return res.status(200).json(notes);
  } catch (err) {
    console.error('Error in GET /api/students/[studentId]/notes:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

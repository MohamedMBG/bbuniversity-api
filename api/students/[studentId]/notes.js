// api/students/[studentId]/notes.js
const getDB = require('../../../_db');  // <= 3 niveaux !!

module.exports = async (req, res) => {
  // CORS
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

    // Récupération robuste du studentId
    let studentId = null;

    // 1) Vercel met souvent les params dynamiques dans req.query
    if (req.query && req.query.studentId) {
      studentId = req.query.studentId;
    } else {
      // 2) fallback: on découpe l'URL
      // /api/students/XXX/notes
      const url = new URL(req.url, `http://${req.headers.host}`);
      const parts = url.pathname.split('/'); // ["", "api", "students", "{id}", "notes"]
      if (parts.length >= 5) {
        studentId = parts[3];
      }
    }

    if (!studentId) {
      return res.status(400).json({ error: 'studentId manquant dans l’URL' });
    }

    // Recherche des notes pour cet étudiant
    const notes = await db
      .collection('notes')
      .find({ studentId })
      .sort({ derniereMiseAJour: -1 })
      .toArray();

    return res.status(200).json(notes);
  } catch (err) {
    console.error('Error in GET /api/students/[studentId]/notes:', err);
    return res.status(500).json({ error: 'Internal server error', details: String(err) });
  }
};

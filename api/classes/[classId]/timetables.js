// api/classes/[classId]/timetables.js
const getDB = require('../../../_db');

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const { classId } = req.query || {};

  if (!classId) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ message: 'classId manquant dans l’URL' }));
  }

  try {
    const db = await getDB();
    const collection = db.collection('timetables');

    // ---------- GET : récupérer l'emploi du temps ----------
    if (req.method === 'GET') {
      const doc = await collection.findOne({ _id: classId });

      if (!doc) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ message: 'Timetable not found' }));
      }

      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      return res.end(JSON.stringify(doc));
    }

    // ---------- POST : enregistrer / écraser l'emploi du temps ----------
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });

      req.on('end', async () => {
        let data = {};
        try {
          data = JSON.parse(body || '{}');
        } catch (e) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ message: 'JSON invalide' }));
        }

        const entries = Array.isArray(data.entries) ? data.entries : [];

        // On normalise chaque entrée
        const cleanedEntries = entries.map(e => ({
          day: e.day || e.jour || null,
          subject: e.subject || e.matiere || null,
          start: e.start || e.heureDebut || null,
          end: e.end || e.heureFin || null,
        }));

        const doc = {
          _id: classId,
          class: data.class || classId,
          entries: cleanedEntries,
          updatedAt: new Date(),
        };

        const result = await collection.updateOne(
          { _id: classId },
          { $set: doc },
          { upsert: true }
        );

        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        return res.end(
          JSON.stringify({
            upsertedId: result.upsertedId || null,
            matchedCount: result.matchedCount,
            modifiedCount: result.modifiedCount,
            timetable: doc,
          })
        );
      });

      return;
    }

    // ---------- Méthode non gérée ----------
    res.statusCode = 405;
    return res.end(JSON.stringify({ message: 'Method Not Allowed' }));
  } catch (err) {
    console.error('Error in /api/classes/[classId]/timetables:', err);
    res.statusCode = 500;
    return res.end(
      JSON.stringify({ message: 'Server error', error: err.message })
    );
  }
};

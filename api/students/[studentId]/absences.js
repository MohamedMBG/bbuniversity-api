// api/students/[studentId]/absences.js
const getDB = require('../../../_db');

/**
 * GET  /api/students/:studentId/absences
 * POST /api/students/:studentId/absences
 */
module.exports = async (req, res) => {
  // CORS
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.statusCode = 204;
    return res.end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');

  const { studentId } = req.query || {};
  if (!studentId) {
    res.statusCode = 400;
    return res.end(JSON.stringify({ error: 'studentId manquant dans l’URL' }));
  }

  // ---------- GET : liste des absences ----------
  if (req.method === 'GET') {
    try {
      const db = await getDB();

      const raw = await db
        .collection('absences')
        .find({ studentUserId: studentId })
        .sort({ date: -1 })
        .toArray();

      const absences = raw.map(a => ({
        _id: a._id ? a._id.toString() : null,
        studentUserId: a.studentUserId || null,
        studentEmail: a.studentEmail || null,
        matiere: a.matiere || null,
        justifiee: !!a.justifiee,
        // on renvoie une string simple (YYYY-MM-DD) ou ce qui est déjà stocké
        date:
          a.date instanceof Date
            ? a.date.toISOString().substring(0, 10)
            : a.date || null,
      }));

      res.statusCode = 200;
      return res.end(JSON.stringify(absences));
    } catch (err) {
      console.error('❌ GET /api/students/[studentId]/absences error:', err);
      res.statusCode = 500;
      return res.end(
        JSON.stringify({ error: 'Server error', details: err.message })
      );
    }
  }

  // ---------- POST : créer une absence ----------
  if (req.method === 'POST') {
    try {
      const db = await getDB();

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
          return res.end(JSON.stringify({ error: 'JSON invalide' }));
        }

        const { studentEmail, matiere, justifiee, date } = data;

        if (!matiere) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'matiere obligatoire' }));
        }

        // parse "dd/MM/yyyy" -> Date
        let dateObj = new Date();
        if (typeof date === 'string') {
          const parts = date.split('/');
          if (parts.length === 3) {
            const [dd, mm, yyyy] = parts;
            const d = parseInt(dd, 10);
            const m = parseInt(mm, 10) - 1;
            const y = parseInt(yyyy, 10);
            if (!isNaN(d) && !isNaN(m) && !isNaN(y)) {
              dateObj = new Date(y, m, d);
            }
          }
        }

        const doc = {
          studentUserId: studentId,             // UID Firebase
          studentEmail: studentEmail || null,
          matiere: matiere,
          justifiee: !!justifiee,
          date: dateObj,
        };

        const result = await db.collection('absences').insertOne(doc);

        const resp = {
          _id: result.insertedId.toString(),
          studentUserId: doc.studentUserId,
          studentEmail: doc.studentEmail,
          matiere: doc.matiere,
          justifiee: doc.justifiee,
          date: doc.date.toISOString().substring(0, 10),
        };

        res.statusCode = 201;
        return res.end(JSON.stringify(resp));
      });
    } catch (err) {
      console.error('❌ POST /api/students/[studentId]/absences error:', err);
      res.statusCode = 500;
      return res.end(
        JSON.stringify({ error: 'Server error', details: err.message })
      );
    }
    return;
  }

  // Méthode non gérée
  res.statusCode = 405;
  return res.end(JSON.stringify({ error: 'Method not allowed' }));
};

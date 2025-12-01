// api/notes/index.js
const getDB = require("../../_db");

/**
 * POST /api/notes
 * Body JSON:
 * {
 *   "studentId": "Er9wdwDnxKehuHL1NTpTtIysbm1",
 *   "professeurId": "Zae8qUQxvcRnRiDSam5xEaV7ia13",
 *   "matiere": "MATH_101",
 *   "controle": 12.5,
 *   "examenFinal": 15,
 *   "participation": 3
 * }
 */
module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      studentId,
      professeurId,
      matiere,
      controle,
      examenFinal,
      participation,
    } = req.body || {};

    // --- validations rapides ---
    if (!studentId || !professeurId || !matiere) {
      return res.status(400).json({
        error: "studentId, professeurId et matiere sont obligatoires",
      });
    }

    const c = Number(controle ?? 0);
    const e = Number(examenFinal ?? 0);
    const p = Number(participation ?? 0);

    // 👉 règle de calcul à adapter si tu veux d’autres coefficients
    const noteGenerale = (c + e + p) / 3;

    const db = await getDB();
    const now = new Date();

    const doc = {
      studentId,
      professeurId,
      matiere,           // ex: "MATH_101"
      controle: c,
      examenFinal: e,
      participation: p,
      noteGenerale,
      derniereMiseAJour: now,
    };

    const result = await db.collection("notes").insertOne(doc);

    return res.status(201).json({
      _id: result.insertedId,
      ...doc,
    });
  } catch (err) {
    console.error("Error in POST /api/notes:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

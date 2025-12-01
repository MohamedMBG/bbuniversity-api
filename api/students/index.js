// api/students/index.js
const getDB = require("../../db");
const { ObjectId } = require("mongodb");

module.exports = async (req, res) => {
  const db = await getDB();

  try {
    if (req.method === "GET") {
      const { studentId, type } = req.query;

      // 1) Si pas de studentId -> liste des étudiants
      if (!studentId) {
        const docs = await db
          .collection("users")
          .find({ role: "student" })
          .toArray();
        return res.status(200).json(docs);
      }

      // 2) Avec studentId + type
      if (type === "absences") {
        const absences = await db
          .collection("absences")
          .find({ studentUserId: studentId })
          .sort({ date: -1 })
          .toArray();
        return res.status(200).json(absences);
      }

      if (type === "subjects") {
        const notes = await db
          .collection("student_subjects")
          .find({ studentId })
          .sort({ lastUpdate: -1 })
          .toArray();
        return res.status(200).json(notes);
      }

      if (type === "complaints") {
        const complaints = await db
          .collection("complaints")
          .find({ studentId })
          .sort({ dateFiled: -1 })
          .toArray();
        return res.status(200).json(complaints);
      }

      // type inconnu
      return res.status(400).json({ error: "Invalid type parameter" });
    }

    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Error in /api/students:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

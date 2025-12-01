// api/classes/[classId]/students.js
const getDB = require("../../../_db");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { classId } = req.query; // vient de {classId} dans l'URL
    if (!classId) {
      return res.status(400).json({ error: "classId manquant" });
    }

    const db = await getDB();

    // On cherche tous les users qui sont des étudiants dans cette classe
    const docs = await db
      .collection("users")
      .find({
        role: "student",
        $or: [
          { classe: classId },      // si tu stockes "classe": "3IIRI"
          { codeClasse: classId },  // si tu stockes "codeClasse": "3IIRI"
          { classeCode: classId },  // au cas où tu as utilisé ce nom là
        ],
      })
      .toArray();

    // On mappe les documents Mongo vers ton modèle Etudiant côté Android
    const students = docs.map((u) => ({
      uid: u.uid || (u._id ? String(u._id) : null),
      nom: u.nom || "",
      prenom: u.prenom || "",
      email: u.email || "",
      matricule:
        u.matricule != null ? Number(u.matricule) : 0, // int en Java
      niveau: u.niveau != null ? Number(u.niveau) : 0,
      filiere: u.filiere || "",
      classeCode: u.codeClasse || u.classeCode || "",
      classe: u.classe || "",
    }));

    return res.status(200).json(students);
  } catch (err) {
    console.error("Error in GET /api/classes/[classId]/students:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// api/students/index.js
const getDB = require("../../_db");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = await getDB();

    // On récupère tous les users avec role = "student"
    const docs = await db
      .collection("users")
      .find({ role: "student" })
      .toArray();

    // On mappe les champs pour coller au modèle Etudiant côté Android
    const students = docs.map((u) => ({
      uid: u.uid || (u._id ? String(u._id) : null),
      nom: u.nom || "",
      prenom: u.prenom || "",
      email: u.email || "",
      matricule: u.matricule != null ? Number(u.matricule) : 0,
      niveau: u.niveau != null ? Number(u.niveau) : 0,
      filiere: u.filiere || "",
      // codeClasse / classeCode / classe
      classeCode:
        u.codeClasse || u.classeCode || "", // si tu l'as appelée codeClasse dans la BD
      classe: u.classe || "",
    }));

    return res.status(200).json(students);
  } catch (err) {
    console.error("Error in GET /api/students:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

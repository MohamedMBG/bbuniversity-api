// api/students/index.js
const getDB = require("../_db"); // importe la fonction exportée par _db.js

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const db = await getDB();

    // Tous les users avec role = "student"
    const docs = await db
      .collection("users")
      .find({ role: "student" })
      .project({
        _id: 1,
        uid: 1,
        nom: 1,
        prenom: 1,
        email: 1,
        matricule: 1,
        niveau: 1,
        filiere: 1,
        classe: 1,
        codeClasse: 1,
        role: 1,
      })
      .toArray();

    // On formate proprement pour ton modèle Etudiant côté Android
    const students = docs.map((s) => ({
      uid: s.uid || s._id.toString(),
      nom: s.nom || "",
      prenom: s.prenom || "",
      email: s.email || "",
      matricule: s.matricule != null ? String(s.matricule) : "",
      niveau: s.niveau != null ? Number(s.niveau) : 0,
      filiere: s.filiere || "",
      classe: s.classe || "",
      codeClasse: s.codeClasse || "",
      role: "student",
    }));

    return res.status(200).json(students);
  } catch (err) {
    console.error("Error in /api/students:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

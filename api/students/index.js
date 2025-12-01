// api/students/index.js
const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB);

    const docs = await db
      .collection("users")
      .find({ role: "student" })          // 💥 ICI : filtre sur role = "student"
      .project({
        _id: 1,
        nom: 1,
        prenom: 1,
        email: 1,
        matricule: 1,
        niveau: 1,
        filiere: 1,
        classe: 1,
        codeClasse: 1,
      })
      .toArray();

    const students = docs.map((s) => ({
      uid: s._id.toString(),
      nom: s.nom || "",
      prenom: s.prenom || "",
      email: s.email || "",
      matricule: s.matricule || "",     // ou String(s.matricule || "")
      niveau: Number(s.niveau || 0),
      filiere: s.filiere || "",
      classe: s.classe || "",
      classeCode: s.codeClasse || "",
      role: "student",
    }));

    return res.status(200).json(students);
  } catch (err) {
    console.error("Error fetching students:", err);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    await client.close();
  }
};

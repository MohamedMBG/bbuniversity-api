// api/complaints/index.js
const getDB = require("../../_db");

module.exports = async (req, res) => {
  // CORS de base
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    return res.end();
  }

  try {
    const db = await getDB();

    // -------------------------
    //  GET /api/complaints
    //  ?teacherId=xxxxx (pour le prof)
    //  (optionnel) ?studentId=yyyy (si un jour tu veux filtrer par étudiant)
    // -------------------------
    if (req.method === "GET") {
      // Vercel fournit req.url, on reconstruit l’URL pour lire les query params
      const url = new URL(req.url, "http://localhost");
      const teacherId = url.searchParams.get("teacherId");
      const studentId = url.searchParams.get("studentId");

      const filter = {};
      if (teacherId) filter.teacherId = teacherId;
      if (studentId) filter.studentId = studentId;

      // Si aucun filtre → tu peux décider de renvoyer tout,
      // ou renvoyer 400. Ici on autorise tout.
      const list = await db
        .collection("complaints")
        .find(filter)
        .sort({ dateFiled: -1 })
        .toArray();

      res.statusCode = 200;
      return res.end(JSON.stringify(list));
    }

    // -------------------------
    //  POST /api/complaints
    //  création d’une nouvelle plainte
    // -------------------------
    if (req.method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });

      req.on("end", async () => {
        let data;
        try {
          data = JSON.parse(body || "{}");
        } catch (e) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: "Invalid JSON" }));
        }

        // champs automatiques
        data.dateFiled = new Date();
        data.status = data.status || "pending";

        const result = await db.collection("complaints").insertOne(data);

        res.statusCode = 201;
        return res.end(JSON.stringify({ _id: result.insertedId, ...data }));
      });

      return; // on sort, la réponse est envoyée dans req.on('end')
    }

    // Méthode non supportée
    res.statusCode = 405;
    return res.end(JSON.stringify({ error: "Method Not Allowed" }));
  } catch (err) {
    console.error("Error in /api/complaints:", err);
    res.statusCode = 500;
    return res.end(
      JSON.stringify({ message: "Server error", error: err.message })
    );
  }
};

// api/classes/index.js
const getDB = require('../../_db');

module.exports = async (req, res) => {
  // --- CORS ---
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const db = await getDB();

  // -----------------------------
  //          GET /classes
  // -----------------------------
  if (req.method === 'GET') {
    try {
      const rows = await db.collection('classes').find({}).toArray();

      const formatted = rows.map(c => ({
        _id: c._id?.toString(),
        name: c.name || null,
        codeClasse: c.codeClasse || null
      }));

      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      return res.end(JSON.stringify(formatted));

    } catch (err) {
      console.error("❌ GET /api/classes error:", err);
      res.statusCode = 500;
      return res.end(JSON.stringify({ error: "Server error", details: err.message }));
    }
  }

  // -----------------------------
  //          POST /classes
  // -----------------------------
  if (req.method === 'POST') {
    try {
      let body = "";
      req.on("data", chunk => (body += chunk.toString()));
      req.on("end", async () => {
        let data = JSON.parse(body || "{}");

        const { name, codeClasse } = data;
        if (!name) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: "name is required" }));
        }

        // Use name as _id (optional)
        if (!data._id) data._id = name;

        const doc = {
          _id: data._id,
          name,
          codeClasse: codeClasse || null
        };

        const result = await db.collection("classes").insertOne(doc);

        res.setHeader("Content-Type", "application/json");
        res.statusCode = 201;
        return res.end(JSON.stringify({
          _id: result.insertedId.toString(),
          ...doc
        }));
      });
    } catch (err) {
      console.error("❌ POST /api/classes error:", err);
      res.statusCode = 500;
      return res.end(JSON.stringify({ error: "Server error", details: err.message }));
    }
  }

  // -----------------------------
  //      METHOD NOT ALLOWED
  // -----------------------------
  res.statusCode = 405;
  return res.end(JSON.stringify({ error: "Method Not Allowed" }));
};

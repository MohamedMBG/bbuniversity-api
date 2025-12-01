// api/classes/[classId]/timetables.js
const { MongoClient } = require('mongodb');

let client;

async function getDB() {
  if (!client) {
    client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
  }
  return client.db(process.env.DB_NAME);
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.statusCode = 405;
    return res.end('Method Not Allowed');
  }

  try {
    const db = await getDB();
    const { classId } = req.query;

    const timetables = await db
      .collection('timetables')
      .find({ classId })
      .toArray();

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(timetables));
  } catch (err) {
    console.error(err);
    res.statusCode = 500;
    res.end(JSON.stringify({ message: 'Server error' }));
  }
};

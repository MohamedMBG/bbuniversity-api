// api/classes/[className]/students.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;   // mets ta URI dans les env Vercel
const client = new MongoClient(uri);
let cachedDb = null;

async function getDB() {
  if (cachedDb) return cachedDb;
  await client.connect();
  cachedDb = client.db('BBUniversity');
  return cachedDb;
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const db = await getDB();
    const { className } = req.query; // sur Vercel → [className].js => req.query.className

    const students = await db.collection('users')
      .find({ role: 'student', classe: className })
      .toArray();

    res.status(200).json(students);
  } catch (e) {
    console.error('Error fetching students by class', e);
    res.status(500).json({ message: 'Server error' });
  }
};

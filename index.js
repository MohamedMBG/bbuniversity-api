// index.js
const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');

// ====== CONFIG ======
const MONGO_URI = 'mongodb+srv://baghdadmohamedme_db_user:5wqSQuKSQ2AsrK5o@unimanagement.w8aj2aa.mongodb.net/';  
const DB_NAME = 'BBUniversity';  
const PORT = 3000;

// ====== INIT ======
const app = express();
app.use(cors());
app.use(express.json());

const client = new MongoClient(MONGO_URI);
let db;

// ====== CONNECT TO MONGO ======
async function connectDB() {
  await client.connect();
  db = client.db(DB_NAME);
  console.log('✅ Connected to MongoDB:', DB_NAME);
}

// ====== API ROUTES ======

// Get user by ID (Firestore doc id)
app.get('/users/:id', async (req, res) => {
  try {
    const user = await db.collection('users').findOne({ _id: req.params.id });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get absences by studentId
app.get('/students/:studentId/absences', async (req, res) => {
  try {
    const absences = await db
      .collection('absences')
      .find({ studentId: req.params.studentId })
      .toArray();
    res.json(absences);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get timetables by classId
app.get('/classes/:classId/timetables', async (req, res) => {
  try {
    const timetables = await db
      .collection('timetables')
      .find({ classId: req.params.classId })
      .toArray();
    res.json(timetables);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// Post a complaint
app.post('/complaints', async (req, res) => {
  try {
    const complaint = req.body;
    complaint.createdAt = new Date();

    const result = await db.collection('complaints').insertOne(complaint);
    res.status(201).json({ _id: result.insertedId, ...complaint });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Server error' });
  }
});

// ====== START SERVER ======
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 API running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Mongo connection failed:', err);
});

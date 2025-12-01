// api/classes/[classId]/students.js
const { getDB } = require('../../_db'); // chemin depuis /classes/[classId]/students.js

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    const db = await getDB();
    const { classId } = req.query;   // /api/classes/:classId/students

    if (!classId) {
      res.status(400).json({ message: 'classId is required' });
      return;
    }

    const students = await db
      .collection('users')
      .find({ role: 'student', classe: classId })
      .toArray();

    res.status(200).json(students);
  } catch (err) {
    console.error('Error fetching students by class', err);
    res.status(500).json({ message: 'Server error' });
  }
};

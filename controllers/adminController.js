const db = require('../db');

exports.dashboard = (req, res) => {
  res.json({ message: 'Admin Dashboard' });
};

exports.createUser = (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Missing user data' });
  }

  const sql = 'INSERT INTO users (name, email, role) VALUES (?, ?, ?)';
  db.query(sql, [name, email, role], (err) => {
    if (err) return res.status(500).json({ error: 'User creation failed' });
    res.json({ message: 'User created successfully' });
  });
};

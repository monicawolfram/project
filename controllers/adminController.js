const db = require('../db');
const path = require('path');



exports.dashboard = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/admin_dashboard.html'));
};
exports.admin_account = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/admin_account.html'));
};
exports.admin_users = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/admin_users.html'));
};
exports.admin_resourcestatus = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/admin_resourcestatus.html'));
};
exports.admin_report = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/admin_report.html'));
};
exports.admin_itsupport = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/admin_itsupport.html'));
};
exports.admin_massage = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/admin_massage.html'));
};
exports.admin_librarian = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/admin_librarian.html'));
};

// Function to create a new user      
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

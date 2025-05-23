const db = require('../db');
const path = require('path');



exports.dashboard = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/admin_dashboard.ejs'));
};
exports.admin_account = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/admin_account.ejs'));
};
exports.admin_users = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/admin_users.ejs'));
};
exports.admin_resourcestatus = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/admin_resourcestatus.ejs'));
};
exports.admin_report = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/admin_report.ejs'));
};
exports.admin_itsupport = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/admin_itsupport.ejs'));
};
exports.admin_massage = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/admin_massage.ejs'));
};
exports.admin_librarian = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/admin/admin_librarian.ejs'));
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

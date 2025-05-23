const db = require('../db');
const path = require('path');

exports.dashboard = (req, res) => {
  res.json({ message: 'User Dashboard' });
};

exports.getNotifications = (req, res) => {
  const query = 'SELECT * FROM notifications WHERE role = "user" ORDER BY created_at DESC';
  db.query(query, (err, results) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(results);
  });
};

exports.interface = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/interface.ejs'));
}; 
exports.home = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/home.ejs'));
};
exports.rules_and_regulation = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/rules_and_regulation.ejs'));
};
exports.books = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/books.ejs'));
};
exports.cs = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/cs.ejs'));
};
exports.yearone = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/yearone.ejs'));
};
exports.yeartwo = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/yeartwo.ejs'));
};
exports.yearthree= (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/yearthree.ejs'));
};
exports.yearfour = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/yearfour.ejs'));
};
exports.It = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/It.ejs'));
};
exports.cse = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/cse.ejs'));
};
  exports.civil = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/civil.ejs'));
};
exports.education = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/education.ejs'));
};
exports.eee = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/eee.ejs'));
};
exports.mech = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/mech.ejs'));
};
exports.isne = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/isne.ejs'));
};
exports.mechatronics = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/mechatronics.ejs'));
};
exports.papers = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/papers.ejs'));
};
exports.projects = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/projects.ejs'));
};
exports.Attendance = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/Attendance.ejs'));
};
exports.borrowing = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/borrowing.ejs'));
};
exports.paying = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/paying.ejs'));
};
exports.resources = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/resources.ejs'));
};
exports.payment = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/payment.ejs'));
};
exports.profile = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/profile.ejs'));
};
exports.AboutUs = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/AboutUs.ejs'));
};
exports.help = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/help.ejs'));
};

exports.sendFeedback = (req, res) => {
  const { user_id, subject, message } = req.body;
  if (!user_id || !subject || !message) {
    return res.status(400).json({ error: 'Missing fields' });
  }

  const sql = 'INSERT INTO feedback (user_id, subject, message) VALUES (?, ?, ?)';
  db.query(sql, [user_id, subject, message], (err) => {
    if (err) return res.status(500).json({ error: 'Insert failed' });
    res.json({ message: 'Feedback sent' });
  });
};

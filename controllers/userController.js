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
  res.sendFile(path.join(__dirname, '../views/user/interface.html'));
}; 
exports.home = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/home.html'));
};
exports.rules_and_regulation = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/rules_and_regulation.html'));
};
exports.books = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/books.html'));
};
exports.cs = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/cs.html'));
};
exports.yearone = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/yearone.html'));
};
exports.yeartwo = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/yeartwo.html'));
};
exports.yearthree= (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/yearthree.html'));
};
exports.yearfour = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/yearfour.html'));
};
exports.It = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/It.html'));
};
exports.cse = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/cse.html'));
};
  exports.civil = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/civil.html'));
};
exports.education = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/education.html'));
};
exports.eee = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/eee.html'));
};
exports.mech = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/mech.html'));
};
exports.isne = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/isne.html'));
};
exports.mechatronics = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/mechatronics.html'));
};
exports.papers = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/papers.html'));
};
exports.projects = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/projects.html'));
};
exports.Attendance = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/Attendance.html'));
};
exports.borrowing = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/borrowing.html'));
};
exports.paying = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/paying.html'));
};
exports.resources = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/resources.html'));
};
exports.payment = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/payment.html'));
};
exports.profile = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/profile.html'));
};
exports.AboutUs = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/AboutUs.html'));
};
exports.help = (req, res) => {
  res.sendFile(path.join(__dirname, '../views/user/help.html'));
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

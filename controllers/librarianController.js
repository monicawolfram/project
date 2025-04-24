const db = require('../db');

exports.dashboard = (req, res) => {
  res.json({ message: 'Librarian Dashboard' });
};

exports.manageResources = (req, res) => {
  const sql = 'SELECT * FROM resources ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: 'Failed to load resources' });
    res.json(results);
  });
};

exports.respondFeedback = (req, res) => {
  const { feedback_id, response, librarian_id } = req.body;
  if (!feedback_id || !response || !librarian_id) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sql = `
    UPDATE feedback 
    SET response = ?, responded_by = ?, response_date = NOW() 
    WHERE id = ?
  `;
  db.query(sql, [response, librarian_id, feedback_id], (err) => {
    if (err) return res.status(500).json({ error: 'Update failed' });
    res.json({ message: 'Feedback responded' });
  });
};

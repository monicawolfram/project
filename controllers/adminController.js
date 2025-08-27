const db = require('../db');
const path = require('path');



exports.dashboard = (req, res) => {
 res.render('admin/admin_dashboard');
};
exports.admin_account = (req, res) => {
 res.render('admin/admin_account');
};


exports.admin_users = async (req, res) => {
  try {
    const [users] = await db.execute('SELECT * FROM users ORDER BY id DESC');
    //return json
    res.render('admin/admin_users', { users });
  } catch (err) {
    console.error('❌ Error fetching users:', err);
    res.render('admin/admin_users', { users: [], error: 'Failed to load users' });
  }
};

exports.admin_resourcestatus = (req, res) => {
 res.render('admin/admin_resourcestatus');
};
exports.admin_report = (req, res) => {
 res.render('admin/admin_report');
};
exports.admin_itsupport = (req, res) => {
 res.render('admin/admin_itsupport');
};
exports.admin_massage = (req, res) => {
 res.render('admin/admin_massage');
};
exports.librarian_Activities = (req, res) => {
 res.render('admin/librarian_Activities');   
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

exports.getAllUsers = async (req, res) => {
  try {
    const [results] = await db.query('SELECT * FROM users');
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.addUser = async (req, res) => {
  try {
    const {
      name,
      reg_no,
      department,
      program,
      college,
      year,
      role,
      gender,
      phone_no
    } = req.body;

    const photoFilename = req.file ? req.file.filename : null;

    if (!name || !reg_no || !department || !program || !college || !year || !role || !gender || !phone_no) {
      return res.status(400).json({ error: 'Missing required user fields' });
    }

    const sql = `
      INSERT INTO users 
      (name, reg_no, department, program, college, year, role, gender, phone_no, photo) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      name,
      reg_no,
      department,
      program,
      college,
      year,
      role,
      gender,
      phone_no,
      photoFilename
    ];

    console.log('📦 Inserting values:', values);

    await db.execute(sql, values); // `db` is already a promise pool
    res.json({ message: 'User added successfully' });

  } catch (err) {
    console.error('❌ Database Insert Error:', err);
    res.status(500).json({ error: 'Something went wrong while saving the user. Please try again later.' });
  }
};
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const {
      name,
      reg_no,
      department,
      program,
      college,
      year,
      role,
      gender,
      phone_no
    } = req.body;

    const photoFilename = req.file ? req.file.filename : null;

    if (!name || !reg_no || !department || !program || !college || !year || !role || !gender || !phone_no) {
      return res.status(400).json({ error: 'Missing required user fields' });
    }

    let sql = `
      UPDATE users SET 
        name = ?, reg_no = ?, department = ?, program = ?, college = ?, 
        year = ?, role = ?, gender = ?, phone_no = ?
        ${photoFilename ? ', photo = ?' : ''}
      WHERE id = ?
    `;

    const values = photoFilename
      ? [name, reg_no, department, program, college, year, role, gender, phone_no, photoFilename, userId]
      : [name, reg_no, department, program, college, year, role, gender, phone_no, userId];

    console.log('📝 Update values:', values);

    await db.execute(sql, values); // use Promise-based pool

    res.json({ message: 'User updated successfully' });

  } catch (err) {
    console.error('❌ Update Error:', err);
    res.status(500).json({ error: 'Something went wrong while updating the user. Please try again later.' });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const id = req.params.id;
    await db.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.approveUser = async (req, res) => {
  const userId = req.params.id;
  try {
    await db.execute('UPDATE users SET is_approved = ? WHERE id = ?', ['yes', userId]);
    res.json({ message: 'User approved successfully' });
  } catch (err) {
    console.error('❌ Error approving user:', err);
    res.status(500).json({ error: 'Failed to approve user' });
  }
};




exports.viewUsers = async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, name, reg_no, department, year FROM users');
    res.json(users); // Must return a JSON array
  } catch (err) {
    console.error('Database error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};
exports.deleteUsersBulk = async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'No user IDs provided for deletion' });
  }

  try {
    // First, fetch the roles of the users to ensure admins are not deleted
    const placeholders = ids.map(() => '?').join(',');
    const [users] = await db.query(`SELECT id, role FROM users WHERE id IN (${placeholders})`, ids);

    // Filter out admins
    const nonAdminIds = users.filter(u => u.role.toLowerCase() !== 'admin').map(u => u.id);

    if (nonAdminIds.length === 0) {
      return res.status(400).json({ error: 'No non-admin users found to delete' });
    }

    // Delete only non-admin users
    const deletePlaceholders = nonAdminIds.map(() => '?').join(',');
    await db.query(`DELETE FROM users WHERE id IN (${deletePlaceholders})`, nonAdminIds);

    res.json({
      message: `${nonAdminIds.length} user(s) deleted successfully.`
    });
  } catch (err) {
    console.error('Error deleting users:', err);
    res.status(500).json({ error: 'Server error deleting users' });
  }
};

exports.approvePendingUsers = async (req, res) => {
  try {
    // Approve all users where is_approved = 'no'
    const [result] = await db.query("UPDATE users SET is_approved = 'yes' WHERE is_approved = 'no'");

    res.json({
      success: true,
      message: `${result.affectedRows} user(s) approved successfully.`
    });
  } catch (error) {
    console.error('Error approving users:', error);
    res.status(500).json({ success: false, message: 'Failed to approve users.' });
  }
};
exports.updateUsersBulk = async (req, res) => { 
  try {
    const updates = req.body.updates; // [{ id, department, program, year }, ...]

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'No updates provided.' });
    }

    // Fetch roles of the users to determine if department/program/year should be updated
    const ids = updates.map(u => u.id);
    const placeholders = ids.map(() => '?').join(',');
    const [users] = await db.query(`SELECT id, role FROM users WHERE id IN (${placeholders})`, ids);

    const updatePromises = updates.map(userUpdate => {
      const dbUser = users.find(u => u.id === userUpdate.id);
      if (!dbUser) return Promise.resolve(); // skip if user not found

      const role = dbUser.role.toLowerCase();
      if (role === 'admin' || role === 'librarian' || role === 'staff') {
        // Skip updating department, program, year for these roles
        return db.query('UPDATE users SET /* other fields if any */ WHERE id = ?', [userUpdate.id]);
      } else {
        // Update department, program, year for students/guests
        return db.query(
          'UPDATE users SET department = ?, program = ?, year = ? WHERE id = ?',
          [userUpdate.department, userUpdate.program, userUpdate.year, userUpdate.id]
        );
      }
    });

    await Promise.all(updatePromises);

    res.json({ success: true, message: `${updates.length} user(s) processed successfully.` });
  } catch (err) {
    console.error('Error updating users:', err);
    res.status(500).json({ success: false, message: 'Server error while updating users.' });
  }
};

exports.viewAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT id, name, reg_no, department, program, college, year, role, gender, phone_no, photo
      FROM users
    `);
    res.json(users);
  } catch (err) {
    console.error('Error loading users:', err);
    res.status(500).json({ error: 'Failed to load users' });
  }
};
exports.getReports = async (req, res) => {
  try {
    const { librarian, type, resource, dateFrom, dateTo } = req.query;

    let sql = `SELECT * FROM reports WHERE 1=1`;
    const values = [];

    if (librarian) {
      sql += ` AND librarian_name = ?`;
      values.push(librarian);
    }
    if (type) {
      sql += ` AND report_type = ?`;
      values.push(type);
    }
    if (resource && type === 'resource') {
      sql += ` AND resource_type = ?`;
      values.push(resource);
    }
    if (dateFrom) {
      sql += ` AND report_date >= ?`;
      values.push(dateFrom);
    }
    if (dateTo) {
      sql += ` AND report_date <= ?`;
      values.push(dateTo);
    }

    sql += ` ORDER BY report_date DESC`;

    const [rows] = await db.execute(sql, values);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching reports:', err);
    res.status(500).json([]);
  }
};

exports.updateReportStatus = async (req, res) => {
  const { id, status } = req.body;
  try {
    await db.execute(`UPDATE reports SET status = ? WHERE id = ?`, [status, id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating status:', err);
    res.json({ success: false });
  }
};
// Fetch all librarian names
exports.getLibrarianList = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT DISTINCT name FROM users WHERE role = 'librarian' ORDER BY name`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching librarians:", err);
    res.status(500).json({ error: "Failed to fetch librarian list" });
  }
};
exports.getAllLibrarianMessages = async (req, res) => {
  try {
    const [messages] = await db.execute(`
      SELECT lm.id, lm.librarian_name, lm.message_type, lm.content, lm.timestamp
      FROM librarian_messages lm
      ORDER BY lm.timestamp DESC
    `);

    const messageIds = messages.map(m => m.id);
    let files = [], replies = [];

    if (messageIds.length > 0) {
      [files] = await db.execute(`
        SELECT * FROM librarian_files WHERE message_id IN (?)
      `, [messageIds]);

      [replies] = await db.execute(`
        SELECT * FROM admin_replies WHERE message_id IN (?)
      `, [messageIds]);
    }

    // Attach files and replies
    const result = messages.map(msg => ({
      ...msg,
      files: files.filter(f => f.message_id === msg.id).map(f => ({
        name: f.filename,
        url: `/uploads/${f.filename}`
      })),
      replies: replies.filter(r => r.message_id === msg.id).map(r => ({
        adminName: r.admin_name,
        text: r.reply,
        time: r.timestamp.toISOString().slice(0, 16).replace('T', ' ')
      }))
    }));

    res.json(result);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
};
exports.replyToLibrarianMessage = async (req, res) => {
  const messageId = req.params.id;
  const { text } = req.body;
  const adminName = 'Admin'; // You could get this from session or auth token

  if (!text) return res.status(400).json({ error: 'Reply text is required.' });

  try {
    await db.execute(`
      INSERT INTO admin_replies (message_id, admin_name, reply)
      VALUES (?, ?, ?)
    `, [messageId, adminName, text]);

    res.json({ success: true });
  } catch (err) {
    console.error('Error replying to message:', err);
    res.status(500).json({ error: 'Failed to save reply' });
  }
};

exports.getAllSupportRequests = async (req, res) => {
  try {
    const [rows] = await db.execute(`SELECT * FROM it_support_issues ORDER BY date DESC`);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server Error' });
  }
};

exports.updateStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.execute(`UPDATE it_support_issues SET status = ? WHERE id = ?`, [status, id]);
    res.json({ message: 'Status updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Status update failed' });
  }
};

exports.getLibrarianActivities = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT la.id, u.name, la.action, la.details, la.timestamp
      FROM librarian_activities la
      LEFT JOIN users u ON la.user_id = u.id
      ORDER BY la.timestamp DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('❌ Failed to fetch activities:', err.message);
    res.status(500).json({ error: 'Failed to fetch librarian activities.' });
  }
};

exports.getAllResources = async (req, res) => {
  const { resourceType, status } = req.query;

  let conditions = [];
  if (resourceType) {
    conditions.push(`resource_type = '${resourceType}'`);
  }
  if (status) {
    conditions.push(`status = '${status}'`);
  }

  let whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : '';

  try {
    const [rows] = await db.execute(`
      SELECT * FROM (
        SELECT id, title AS resource_name, 'book' AS resource_type, status, date_added FROM books WHERE is_deleted = 'no'
        UNION ALL
        SELECT id, title AS resource_name, 'paper' AS resource_type, status, date_added FROM papers WHERE is_deleted = 'no'
        UNION ALL
        SELECT id, title AS resource_name, 'project' AS resource_type, status, date_added FROM projects WHERE is_deleted = 'no'
      ) AS combined
      ${whereClause}
      ORDER BY date_added DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load resources' });
  }
};

exports.updateResourceStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required' });
  }

  try {
    const [result] = await db.execute(
      `UPDATE resources SET status = ? WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    res.json({ message: 'Status updated successfully' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Server error' });
  }
};


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
    const placeholders = ids.map(() => '?').join(',');
    await db.query(`DELETE FROM users WHERE id IN (${placeholders})`, ids);
    res.json({ message: `${ids.length} user(s) deleted successfully` });
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
    const updates = req.body.updates; // [{ id, department, year }, ...]

    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({ message: 'No updates provided.' });
    }

    const updatePromises = updates.map(user => {
      return db.query(
        'UPDATE users SET department = ?, year = ? WHERE id = ?',
        [user.department, user.year, user.id]
      );
    });

    await Promise.all(updatePromises);

    res.json({ success: true, message: `${updates.length} user(s) updated successfully.` });
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



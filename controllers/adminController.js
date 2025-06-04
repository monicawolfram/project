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
exports.admin_librarian = (req, res) => {
 res.render('admin/admin_librarian');
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
exports.updateUser = (req, res) => {
  if (!req.body) {
    return res.status(400).json({ error: 'Missing request body' });
  }

  const { name, reg_no, department, program, college, year, role, gender, phone_no } = req.body;
  const photo = req.file ? `/uploads/${req.file.filename}` : null;
  const id = req.params.id;

  const sql = `UPDATE users SET name = ?, reg_no = ?, department = ?, program = ?, college = ?, year = ?, role = ?, gender = ?, phone_no = ?${photo ? ', photo = ?' : ''} WHERE id = ?`;

  const params = [name, reg_no, department, program, college, year, role, gender, phone_no];
  if (photo) params.push(photo);
  params.push(id);

  db.query(sql, params, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User updated successfully' });
  });
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

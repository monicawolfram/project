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
 res.render('user/interface');
}; 
exports.home = (req, res) => {
 res.render('user/home');
};
exports.rules_and_regulation = (req, res) => {
 res.render('user/rules_and_regulation');
};
exports.books = (req, res) => {
 res.render('user/books');
};
exports.cs = (req, res) => {
 res.render('user/cs');
};
exports.yearone = (req, res) => {
 res.render('user/yearone');
};
exports.yeartwo = (req, res) => {
 res.render('user/yeartwo');
};
exports.yearthree= (req, res) => {
 res.render('user/yearthree');
};
exports.yearfour = (req, res) => {
 res.render('user/yearfour');
};
exports.It = (req, res) => {
 res.render('user/It');
};
exports.cse = (req, res) => {
 res.render('user/cse');
};
  exports.civil = (req, res) => {
 res.render('user/civil');
};
exports.education = (req, res) => {
 res.render('user/education');
};
exports.eee = (req, res) => {
 res.render('user/eee');
};
exports.mech = (req, res) => {
 res.render('user/mech');
};
exports.isne = (req, res) => {
 res.render('user/isne');
};
exports.mechactronics = (req, res) => {
 res.render('user/mechactronics');
};
exports.papers = (req, res) => {
 res.render('user/papers');
};
exports.projects = (req, res) => {
 res.render('user/projects');
};
exports.Attendance = (req, res) => {
 res.render('user/Attendance');
};
exports.borrowing = (req, res) => {
 res.render('user/borrowing');
};
exports.paying = (req, res) => {
 res.render('user/paying');
};
exports.resources = (req, res) => {
 res.render('user/resources');
};
exports.borrow = (req, res) => {
 res.render('user/borrow'); 
}
exports.payment = (req, res) => {
 res.render('user/payment');
};
exports.profile = (req, res) => {
 res.render('user/profile');
};
exports.AboutUs = (req, res) => {
 res.render('user/AboutUs');
};
exports.help = (req, res) => {
 res.render('user/help');
};
exports.register = (req, res) => {
 res.render('user/register');     
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





exports.getUserByReg_no = async (req, res) => {
  const reg_no = req.query.reg;  // <-- get from query param 'reg'
  if (!reg_no) {
    return res.status(400).json({ success: false, message: "reg query parameter is required" });
  }

  try {
    const [rows] = await db.execute("SELECT * FROM users WHERE reg_no = ?", [reg_no]);
    if (rows.length === 0) {
      return res.json({ success: false, message: "User not found" });
    }

    const user = rows[0];
    res.json({
      success: true,
      name: user.name,
      reg_no: user.reg_no,
      program: user.program,
      department: user.department,
      gender: user.gender,
      college: user.college,
      year: user.year,
      role: user.role,
      Time_In: user.time_in,
      Time_Out: user.time_out,
      image: user.photo
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAttendanceByMonthYear = async (req, res) => {
  try {
    const { regNo } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and year query parameters are required' });
    }

    // 1. Fetch user info (name) by regNo
    const [userRows] = await db.execute(
      `SELECT name FROM users WHERE reg_no = ? LIMIT 1`,
      [regNo]
    );

    if (userRows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userName = userRows[0].name;

    // 2. Fetch attendance records
    const query = `
      SELECT DATE_FORMAT(date, '%Y-%m-%d') AS date,
             DAYNAME(date) AS day,
             TIME_FORMAT(time_in, '%H:%i') AS time_in,
             TIME_FORMAT(time_out, '%H:%i') AS time_out
      FROM attendance
      WHERE reg_no = ?
        AND MONTH(date) = ?
        AND YEAR(date) = ?
      ORDER BY date ASC
    `;

    const [rows] = await db.execute(query, [regNo, month, year]);

    const attendanceMap = {};

    rows.forEach(record => {
      const { date, day, time_in, time_out } = record;
      const dayKey = day.toLowerCase();

      if (!attendanceMap[date]) {
        attendanceMap[date] = {
          date,
          monday: null,
          tuesday: null,
          wednesday: null,
          thursday: null,
          friday: null
        };
      }

      if (['monday', 'tuesday', 'wednesday', 'thursday', 'friday'].includes(dayKey)) {
        attendanceMap[date][dayKey] = {
          time_in: time_in || '-',
          time_out: time_out || '-'
        };
      }
    });

    const attendanceArray = Object.values(attendanceMap);

    // 3. Send response with user name and attendance
    res.json({
      name: userName,
      attendance: attendanceArray
    });

  } catch (error) {
    console.error('Error fetching attendance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


exports.getBorrowedResources = async (req, res) => {
  const regNo = req.params.userId;

  if (!regNo) {
    return res.status(400).json({ message: 'Missing user registration number' });
  }

  try {
    const [rows] = await db.execute(`
      SELECT 
        br.id,
        br.borrower_id,
        br.borrower_name,
        br.resource_type,
        br.borrow_date,
        br.return_date,
        br.status
      FROM borrow_requests br
      WHERE br.borrower_id = ?
      ORDER BY br.borrow_date DESC
    `, [regNo]);

    res.json(rows);
  } catch (error) {
    console.error('Error fetching borrowed resources:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




exports.payFine = async (req, res) => {
  const { borrowerID, resourceType, resourceId, paymentMethod } = req.body;

  try {
    await db.execute(`
      UPDATE borrowing_transactions
      SET payment_status = 'Paid', receipt_method = ?
      WHERE borrower_id = ? AND resource_type = ? AND resource_id = ? AND payment_status = 'Unpaid'
    `, [paymentMethod, borrowerID, resourceType, resourceId]);

    res.json({ message: 'Payment successful' });
  } catch (error) {
    console.error('Error updating payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getPaymentHistoryByRegNo = (req, res) => {
    const regNo = req.params.regNo;

    const query = `
        SELECT 
            users.reg_no AS studentId,
            users.full_name AS studentName,
            payments.payment_date AS date,
            payments.amount,
            payments.payment_method AS method,
            payments.status
        FROM payments
        JOIN users ON payments.user_id = users.id
        WHERE users.reg_no = ?
        ORDER BY payments.payment_date DESC
    `;

    db.query(query, [regNo], (err, results) => {
        if (err) {
            console.error("Error fetching payments:", err);
            return res.status(500).json({ error: "Database error" });
        }

        res.json(results);
    });
};

exports.registerUser = async (req, res) => {
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

    // Collect missing fields dynamically
    const missingFields = [];
    if (!name) missingFields.push('name');
    if (!reg_no) missingFields.push('reg_no');
    if (!department) missingFields.push('department');
    if (!program) missingFields.push('program');
    if (!college) missingFields.push('college');
    if (!year) missingFields.push('year');
    if (!role) missingFields.push('role');
    if (!gender) missingFields.push('gender');
    if (!phone_no) missingFields.push('phone_no');
    if (!photoFilename) missingFields.push('photo');

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: 'Missing required registration fields',
        missingFields
      });
    }

    const sql = `
      INSERT INTO users 
      (name, reg_no, department, program, college, year, role, gender, phone_no, photo, is_approved) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
      photoFilename,
      'no' // default value for is_approved
    ];

    console.log('📦 Inserting user:', values);

    await db.execute(sql, values);

    res.json({
      success: true,
      message: 'User registered successfully'
    });

  } catch (err) {
    console.error('❌ Registration error:', err);
    res.status(500).json({ error: 'Something went wrong while registering the user.' });
  }
};

exports.getBookDepartments = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT b1.*
      FROM books b1
      INNER JOIN (
        SELECT department, MIN(id) as min_id
        FROM books
        WHERE is_deleted = 'no'
        GROUP BY department
      ) b2 ON b1.id = b2.min_id
      ORDER BY b1.department ASC
    `);

    const data = rows.map(book => ({
      department: book.department,
      image: book.image,
      page: book.department.toLowerCase().replace(/\s+/g, '-')
    }));

    res.json(data);
  } catch (err) {
    console.error('❌ Error fetching department catalogs:', err);
    res.status(500).json({ error: 'Failed to load departments' });
  }
};
exports.getBooksByDepartment = async (req, res) => {
  const dept = req.params.department;

  try {
    const [books] = await db.execute(
      "SELECT * FROM books WHERE department = ? AND is_deleted = 'no' ORDER BY title ASC",
      [dept]
    );

    if (books.length === 0) {
      return res.render('user/book_list', { books: [], department: dept, message: 'No books found.' });
    }

    res.render('user/book_list', {
      books: books,
      department: dept,
      message: null
    });
  } catch (err) {
    console.error('❌ Error fetching books:', err);
    res.status(500).render('user/book_list', {
      books: [],
      department: dept,
      message: 'Failed to fetch books.'
    });
  }
};


exports.viewBooksByDepartment = (req, res) => {
  const dept = req.params.department;
  res.redirect(`/user/books/${dept}`);
};


// Get all departments from the "departments" table
exports.getPaperDepartments = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT p1.*
      FROM papers p1
      INNER JOIN (
        SELECT department, MIN(id) as min_id
        FROM papers
        WHERE is_deleted = 'no'
        GROUP BY department
      ) p2 ON p1.id = p2.min_id
      ORDER BY p1.department ASC
    `);

    const data = rows.map(paper => ({
      department: paper.department,
      image: paper.image_url,
      page: paper.department.toLowerCase().replace(/\s+/g, '-')
    }));

    res.json(data);
  } catch (err) {
    console.error('❌ Error fetching paper departments:', err);
    res.status(500).json({ error: 'Failed to load paper departments' });
  }
};

exports.getPapersByDepartment = async (req, res) => {
  const department = req.params.department;

  try {
    const [papers] = await db.query('SELECT * FROM papers WHERE department = ?', [department]);

    if (papers.length === 0) {
      return res.render('user/paper_list', { papers: [], department, message: 'No papers available for this department.' });
    }

    res.render('user/paper_list', { papers, department });
  } catch (error) {
    console.error(error);
    res.render('user/paper_list', { papers: [], department, message: 'Failed to load papers.' });
  }
};
exports.viewPapersByDepartment = (req, res) => {
  const dept = req.params.department;
  res.redirect(`/user/show-papers/${dept}`);
};


exports.getProjectDepartments = async (req, res) => {
  try {
    const [rows] = await db.execute(`
      SELECT DISTINCT department FROM projects WHERE is_deleted = 'no' ORDER BY department ASC
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load departments' });
  }
};
// userController.js
exports.showProjectsByDepartment = async (req, res) => {
  try {
    const department = req.params.department;

    const [projects] = await db.execute(`
      SELECT id, image, title, author, year, file_url
      FROM projects
      WHERE department = ? AND is_deleted = 'no'
      ORDER BY date_added DESC
    `, [department]);

    // Map DB column `image` to `image_url` for EJS template
    const mappedProjects = projects.map(p => ({
      ...p,
      image_url: p.image,  // so your template works with image_url
    }));

    if (mappedProjects.length === 0) {
      return res.render('user/project_list', {
        department,
        projects: [],
        message: 'No projects found for this department.'
      });
    }

    res.render('user/project_list', {
      department,
      projects: mappedProjects,
      message: null
    });
  } catch (error) {
    console.error('Error fetching projects by department:', error);
    res.render('user/project_list', {
      department: req.params.department,
      projects: [],
      message: 'Error loading projects. Please try again later.'
    });
  }
};

exports.viewProjectsByDepartment = (req, res) => {
  const dept = req.params.department;
  res.redirect(`/user/show-projects/${dept}`);
};
// controllers/userController.js
exports.getProjectsByDepartment = async (req, res) => {
  try {
    const department = req.params.department;
    if (!department) {
      return res.status(400).json({ message: 'Department required' });
    }
    const [rows] = await db.execute(`
      SELECT id, image, title, author, status, year, project_code, date_added 
      FROM projects WHERE department = ? AND is_deleted = 'no' ORDER BY date_added DESC
    `, [department]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error loading projects' });
  }
};

// controller/userController.js
exports.submitBorrow = (req, res) => {
  const { borrower_id, borrower_name, resource_type, borrow_date, return_date } = req.body;

  if (!borrower_id || !borrower_name || !resource_type || !borrow_date || !return_date) {
    return res.json({ success: false, error: 'All fields are required' });
  }

  const query = `
    INSERT INTO borrow_requests (borrower_id, borrower_name, resource_type, borrow_date, return_date, status)
    VALUES (?, ?, ?, ?, ?, 'Pending')
  `;

  db.query(query, [borrower_id, borrower_name, resource_type, borrow_date, return_date], (err) => {
    if (err) {
      console.error('DB Insert Error:', err);
      return res.json({ success: false, error: 'Database error' });
    }

    // Optional: notify librarian (e.g., via another table or flag)
    // e.g., INSERT INTO notifications (type, message, target_role) ...

    res.json({ success: true, redirect: '/user/borrowed-resources' }); // <-- Redirect after success
  });
};







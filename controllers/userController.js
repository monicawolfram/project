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

exports.getBorrowedResources = (req, res) => {
    const userId = req.params.id;

    const sql = `
        SELECT borrower_id, borrower_name, resource_type, borrow_date, return_date, fine_amount, payment_status, receipt_method
        FROM borrowed_resources
        WHERE borrower_id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) {
            console.error('Error fetching borrowed resources:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
};

exports.payFine = (req, res) => {
    const { borrowerID, resourceType, paymentMethod } = req.body;

    const sql = `
        UPDATE borrowed_resources 
        SET payment_status = 'Paid', receipt_method = ?
        WHERE borrower_id = ? AND resource_type = ?
    `;

    db.query(sql, [paymentMethod, borrowerID, resourceType], (err, result) => {
        if (err) {
            console.error('Error updating fine payment:', err);
            return res.status(500).json({ error: 'Payment update failed' });
        }
        res.json({ success: true });
    });
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












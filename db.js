const mysql = require('mysql2');

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Admin', // your MySQL password
  database: 'librarian_db'
});
db.connect((err) => {
  if (err) throw err;
  console.log('✅ Connected to MySQL database');
});

module.exports = db;

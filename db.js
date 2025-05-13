require('dotenv').config();
const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Admin',
  database: process.env.DB_NAME || 'librarian_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000,
  // acquireTimeout: 30000 <-- USIITUMIE
});


pool.on('error', (err) => {
  console.error('Database pool error:', err.message);
});

module.exports = pool;
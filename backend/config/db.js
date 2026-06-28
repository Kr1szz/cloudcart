const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cloudcart',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  keepAliveInitialDelay: 10000,
  enableKeepAlive: true
});

// Test connection
pool.getConnection()
  .then(conn => {
    console.log('Successfully connected to MySQL/RDS database.');
    conn.release();
  })
  .catch(err => {
    console.error('Error connecting to MySQL/RDS database:', err.message);
  });

module.exports = pool;

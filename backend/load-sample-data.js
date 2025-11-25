const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function loadSampleData() {
  let connection;
  try {
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'load-bank-accounts.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || '193.203.184.9',
      user: process.env.DB_USER || 'u331468302_dennup_pos',
      password: process.env.DB_PASSWORD || 'gM7LfqqUK;|',
      database: process.env.DB_NAME || 'u331468302_dennup_pos',
      multipleStatements: true,
    });

    console.log('Connected to database');

    // Execute the SQL file
    await connection.query(sql);
    console.log('✓ Sample data loaded successfully');

    await connection.end();
  } catch (error) {
    console.error('Error loading sample data:', error);
    if (connection) await connection.end();
    process.exit(1);
  }
}

loadSampleData();

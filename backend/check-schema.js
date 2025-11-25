const mysql = require('mysql2/promise');

async function checkSchema() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: '193.203.184.9',
      user: 'u331468302_dennup_pos',
      password: 'gM7LfqqUK;|',
      database: 'u331468302_dennup_pos',
    });

    const [columns] = await connection.execute('DESCRIBE bank_accounts');

    console.log('Bank Accounts Table Columns:');
    columns.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type}`);
    });

    await connection.end();
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkSchema();

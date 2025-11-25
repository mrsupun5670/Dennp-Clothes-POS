const mysql = require('mysql2/promise');

async function checkBankAccounts() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: '193.203.184.9',
      user: 'u331468302_dennup_pos',
      password: 'gM7LfqqUK;|',
      database: 'u331468302_dennup_pos',
    });

    const [rows] = await connection.execute('SELECT * FROM bank_accounts WHERE shop_id = 1');

    console.log(`Total bank accounts in database for shop 1: ${rows.length}`);
    console.log('\nBank Accounts:');
    rows.forEach(acc => {
      console.log(`  ID ${acc.bank_account_id}: ${acc.bank_name} - ${acc.account_number} - Balance: ${acc.current_balance}`);
    });

    await connection.end();
  } catch (error) {
    console.error('Database error:', error.message);
  }
}

checkBankAccounts();

const mysql = require('mysql2/promise');

async function checkPayments() {
  let connection;
  try {
    connection = await mysql.createConnection({
      host: '193.203.184.9',
      user: 'u331468302_dennup_pos',
      password: 'gM7LfqqUK;|',
      database: 'u331468302_dennup_pos',
    });

    const [rows] = await connection.execute('SELECT payment_id FROM payments WHERE shop_id = 1 ORDER BY payment_id');

    console.log(`Total payments in database for shop 1: ${rows.length}`);
    console.log('Payment IDs:', rows.map(r => r.payment_id).sort((a,b) => a-b));

    await connection.end();
  } catch (error) {
    console.error('Database error:', error.message);
  }
}

checkPayments();

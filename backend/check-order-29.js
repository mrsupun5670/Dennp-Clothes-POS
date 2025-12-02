const mysql = require('mysql2/promise');

async function checkOrder29() {
  const connection = await mysql.createConnection({
    host: '193.203.184.9',
    user: 'u331468302_dennep_pos',
    password: 'Gamage02121122',
    database: 'u331468302_dennep_pos'
  });

  try {
    const [rows] = await connection.execute('SELECT * FROM orders WHERE order_id = 29');
    console.log('Order 29 from database:');
    console.log(JSON.stringify(rows[0], null, 2));
  } finally {
    await connection.end();
  }
}

checkOrder29().catch(console.error);

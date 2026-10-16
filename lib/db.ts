// lib/db.js

import postgres from 'postgres';

const sql = postgres(`${process.env.DATABASEURL}`, {
  onnotice: (notice) => {
    console.log('NOTICE:', notice.message);
  },
 
});

// Log connection established
sql`SELECT 1`.then(() => {
  console.log('Database connection established');
}).catch((error) => {
  console.error('Database connection failed:', error);
});

export default sql;

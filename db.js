const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: 'b77rwfurwqefuud8vtva-mysql.services.clever-cloud.com',
  user: 'ujolys7wapcc4fxy',
  password: 'cZAkJuq4CXfbkZkOIDSK',
  database: 'b77rwfurwqefuud8vtva'
});

const query = async (sql, params) => {
  try {
    const [results, fields] = await connection.execute(sql, params);
    return results;
  } catch (err) {
    throw err;
  }
};

module.exports = query;

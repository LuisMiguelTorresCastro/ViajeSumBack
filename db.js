const mysql = require('mysql2/promise');

const connection = mysql.createPool({
  host: 'localhost',
  user: 'Torres',
  password: 'Luis0207@',
  database: 'BD_ViajeSum'
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

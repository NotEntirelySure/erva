const path = require('path');
const fs = require("fs");
const jwt = require("jsonwebtoken");
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'superuser',
  host: 'localhost',
  database: 'erva',
  password: 'root',
  port: 5432,
});

const getUsers = () => {
  return new Promise(function(resolve, reject) {
    pool.query(`
      SELECT
        u.users_id,
        u.users_first_name,
        u.users_last_name,
        u.users_email,
        u.users_created_at,
        u.users_fk_role,
        u.users_fk_type,
        u.users_enabled,
        r.roles_id,
        r.roles_name,
        at.at_id,
        at.at_name
      FROM users AS u
      LEFT JOIN roles AS r
      ON r.roles_id=u.users_fk_role
      LEFT JOIN accounttypes AS at
      ON at.at_id=u.users_fk_type;
    `, (error, results) => {
      if (error) {reject(error)}
      resolve(results.rows);
    })
  }) 
}

module.exports = {
  getUsers
};
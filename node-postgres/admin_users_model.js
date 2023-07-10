//allows access to .env file for environment variable declaration
require('dotenv').config();
const path = require('path');
const fs = require("fs");
const jwt = require("jsonwebtoken");
const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.API_BASE_USER_ACCOUNT,
  host: process.env.API_BASE_HOST_URL,
  database: process.env.API_BASE_DATABASE_NAME,
  password: process.env.API_BASE_DATABASE_PASSWORD,
  port: process.env.API_BASE_PORT_NUMBER,
});

function getUsers() {
  return new Promise((resolve, reject) => {
    pool.query(`
      SELECT
        u.users_id,
        u.users_first_name,
        u.users_last_name,
        u.users_email,
        u.users_created_at,
        u.users_enabled,
        u.users_verified,
        r.roles_id,
        r.roles_name,
        at.at_id,
        at.at_name
      FROM users AS u
      LEFT JOIN roles AS r
      ON r.roles_id=u.users_fk_role
      LEFT JOIN accounttypes AS at
      ON at.at_id=u.users_fk_type;`,
      (error, results) => {
        if (error) {reject(error)}
        resolve({code:200, data:results});
      }
    );
  });
}

function deleteUser(data) {
  return new Promise((resolve, reject) => {
    pool.query(
      'DELETE FROM users WHERE users_id=$1',
      [data.userId],
      (error, result) => {
        if (error) {
          if (error.code === "23503") resolve({code:500,message:'User could not be deleted. User is still referenced in permissions table. Remove user\'s permissions and try again.'})
          resolve({code:500,message:error.detail});
        };
        resolve({code:200})
    });
  });
};

module.exports = {
  getUsers,
  deleteUser
}
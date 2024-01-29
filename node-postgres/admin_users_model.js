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
        if (error) reject(error)
        const users = results.rows.map(row => ({
          id: row.users_id,
          firstName: row.users_first_name,
          lastName: row.users_last_name,
          email: row.users_email,
          createdAt: new Date(row.users_created_at),
          enabled: row.users_enabled,
          verified:row.users_verified,
          role: {
            id: row.roles_id,
            name: row.roles_name,
          },
          accountType: {
            id: row.at_id,
            name: row.at_name,
          }
          }));
        resolve (users);
      }
    );
  });
};

function getRoles() {
  return new Promise((resolve, reject) => {
    pool.query(
      'SELECT * FROM ROLES',
      (error, result) => {
        if (error) reject(error);
        const roles = result.rows.map(entry => (
          {
            id:entry.roles_id,
            name:entry.roles_name
          }
        ))
        resolve(roles);
      });
  });
};

function deleteUser(userId) {
  
  return new Promise((resolve, reject) => {
    pool.query(
      'DELETE FROM users WHERE users_id=$1',
      [userId],
      (error, result) => {
        if (error) {
          const errorResult = {success: false};
          if (error.code === "23503") {
            errorResult.errorCode = "23503";
            errorResult.errorMessage = "User could not be deleted. User is still referenced in permissions table. Remove user\'s permissions and try again.";
          }
          else {
            errorResult.errorCode = error.code;
            errorResult.errorMessage = error.detail;
          };
          resolve(errorResult);
        };
        resolve({success:true});
    });
  });
};

module.exports = {
  getUsers,
  getRoles,
  deleteUser
}
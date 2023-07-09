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

const getUsers = () => {
  return new Promise((resolve, reject) => {
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
      ON at.at_id=u.users_fk_type;`,
      (error, results) => {
        if (error) {reject(error)}
        resolve(results.rows);
      }
    );
  });
};

function getOffices() {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM offices;', (error, results) => {
      if (error) {reject(error)}
      resolve(results.rows);
    });
  }); 
};

function addOffice(data) {
  return new Promise((resolve, reject) => {
    pool.query(`
      INSERT INTO offices(
        offices_name,
        offices_address,
        offices_city,
        offices_state,
        offices_zip,
        offices_lat,
        offices_long,
        offices_image
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8);`, 
      [
        data.name,
        data.address,
        data.city,
        data.state.value,
        data.zip,
        data.lat,
        data.long,
        data.image
      ],
      (error, results) => {
        if (error) {reject(error)}
        resolve({code:200});
      }
    );
  }); 
};

function editOffice(data) {
  return new Promise((resolve, reject) => {
    pool.query(`
      UPDATE offices
      SET
        offices_name=$1,
        offices_address=$2,
        offices_city=$3,
        offices_state=$4,
        offices_zip=$5,
        offices_lat=$6,
        offices_long=$7,
        offices_image=$8
      WHERE offices_id=$9;`, 
      [
        data.name,
        data.address,
        data.city,
        data.state.value,
        data.zip,
        data.lat,
        data.long,
        data.image,
        data.id
      ],
      (error, results) => {
        if (error) {reject(error)}
        resolve({code:200});
      }
    );
  }); 
};

function deleteOffice(data) {
  return new Promise((resolve, reject) => {
    pool.query(
      'DELETE FROM offices WHERE offices_id=$1;', 
      [data.id],
      (error, results) => {
        if (error) reject(error);
        resolve({code:200});
      }
    );
  }); 
};


function getFacilities() {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM facilities;', (error, results) => {
      if (error) {reject(error)}
      resolve(results.rows);
    });
  }); 
};

function addFacility(data) {
  return new Promise((resolve, reject) => {
    pool.query(`
      INSERT INTO facilities (
        facilities_name,
        facilities_fk_offices,
        facilities_address,
        facilities_city,
        facilities_state,
        facilities_zip,
        facilities_lat,
        facilities_long,
        facilities_image,
        facilities_code
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10);`, 
      [
        data.name,
        data.organization.organizationId,
        data.address,
        data.city,
        data.state.value,
        data.zip,
        data.lat,
        data.long,
        data.image.fileName,
        data.facilityCode
      ],
      (error, results) => {
        if (error) {reject(error)}
        resolve({code:200});
      }
    );
  }); 
};

function editFacility(data) {
  return new Promise((resolve, reject) => {
    pool.query(`
      UPDATE facilities
      SET
        facilities_name=$1,
        facilities_fk_offices=$2,
        facilities_address=$3,
        facilities_city=$4,
        facilities_state=$5,
        facilities_zip=$6,
        facilities_lat=$7,
        facilities_long=$8,
        facilities_image=$9,
        facilities_code=$10
      WHERE facilities_id=$11;`, 
      [
        data.name,
        data.organization.organizationId,
        data.address,
        data.city,
        data.state.value,
        data.zip,
        data.lat,
        data.long,
        data.image.fileName,
        data.facilityCode,
        data.id
      ],
      (error, results) => {
        if (error) {reject(error)}
        resolve({code:200});
      }
    );
  }); 
};

function deleteFacility(data) {
  return new Promise((resolve, reject) => {
    pool.query(
      'DELETE FROM facilities WHERE facilities_id=$1;', 
      [data.id],
      (error, results) => {
        if (error) reject(error);
        resolve({code:200});
      }
    );
  }); 
};

module.exports = {
  getUsers,
  getOffices,
  addOffice,
  editOffice,
  deleteOffice,
  getFacilities,
  addFacility,
  editFacility,
  deleteFacility
};
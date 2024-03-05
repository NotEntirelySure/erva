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

function getOrganizations() {
  return new Promise((resolve, reject) => {
    pool.query('SELECT * FROM offices;', (error, results) => {
      if (error) reject(error);
      const orgs = results.rows.map(org => (
        {
          id:org.offices_id,
          image:org.offices_image,
          name:org.offices_name,
          address:org.offices_address,
          city:org.offices_city,
          state:org.offices_state,
          zip:org.offices_zip
        }
      ));
      resolve(orgs);
    });
  }); 
};

function addOrganization(data) {
  return new Promise((resolve, reject) => {
    pool.query(`
      INSERT INTO offices(
        offices_name,
        offices_address,
        offices_city,
        offices_state,
        offices_zip
      )
      VALUES ($1,$2,$3,$4,$5);`, 
      [
        data.name,
        data.address,
        data.city,
        data.state,
        parseInt(data.zip),
      ],
      (error, results) => {
        if (error) {
          resolve({
            success:false,
            errorCode:error.code,
            errorMessage:error.detail
          })
        };
        resolve({success:true});
      }
    );
  }); 
};

function editOrganization(data) {
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
        data.state,
        parseInt(data.zip),
        data.lat,
        data.long,
        data.image,
        data.id
      ],
      (error) => {
        if (error) {
          resolve({
            success:false,
            errorCode:error.code,
            errorMessage:error.detail

          })
        };
        resolve({success:true});
      }
    );
  }); 
};

function deleteOrganization(data) {
  return new Promise((resolve, reject) => {
    pool.query(
      'DELETE FROM offices WHERE offices_id=$1;', 
      [data.id],
      (error, results) => {
        if (error) {
          resolve({
            success:false,
            errorCode:error.code,
            errorMessage:error.detail

          })
        };
        resolve({success:true});
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
  getOrganizations,
  addOrganization,
  editOrganization,
  deleteOrganization,
  getFacilities,
  addFacility,
  editFacility,
  deleteFacility
};
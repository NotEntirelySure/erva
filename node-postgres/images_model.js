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

const getImage = (directory, imageName) => {
  let dirExists = fs.existsSync(`../${directory}/${imageName}`);
  if (dirExists) {
    const base64 = fs.readFileSync(`../${directory}/${imageName}`, "base64");
    return base64;
  }
  if (!dirExists) {
    const base64 = fs.readFileSync(`../${directory}/default.jpg`, "base64");
    return base64;
  }
}

module.exports = {getImage};
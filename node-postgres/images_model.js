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
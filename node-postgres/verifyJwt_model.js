//allows access to .env file for environment variable declaration
require('dotenv').config();

const jwt = require("jsonwebtoken");
const { resolve } = require('path');

const verifyJwt = (token) => {
  return new Promise((resolve, reject) => {
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, result) => {
        if(err) {reject({"errorCode":401, "error":err});}
        if(result) {resolve({"result":result});}
      });
    }
  })
}

const verifyJwtInternal = (token) => {
  return new Promise((resolve) => {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, result) => {
      if(err) resolve({"verified":false,"error":err.message})
      if(result) resolve({"verified":true,"result":result})
    });
  })
}

module.exports = {verifyJwt, verifyJwtInternal}
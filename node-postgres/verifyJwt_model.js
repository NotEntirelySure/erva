//allows access to .env file for environment variable declaration
require('dotenv').config();

const jwt = require("jsonwebtoken");
const { resolve } = require('path');

const verifyJwt = (token) => {
  return new Promise((resolve, reject) => {
    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, (err, result) => {
        if(err) {
          if(err.message = "jwt expired") resolve({"errorCode":498, "error":"token expired"})
          resolve({"errorCode":401, "error":"invalid token"});
        }
        if(result) resolve({"result":result});
      });
    }
  })
}

const _verifyJwt = (token) => {
  return new Promise((resolve) => {
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, result) => {
      if(err) resolve({"verified":false,"error":err.message})
      if(result) resolve({"verified":true,"result":result})
    });
  })
}

module.exports = {verifyJwt, _verifyJwt}
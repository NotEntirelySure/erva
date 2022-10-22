const jwt = require("jsonwebtoken");

const verifyJwt = (token, secret) => {
  return new Promise(function(resolve, reject) {
    if (token) {
      jwt.verify(token, secret, (err, result) => {
        if(err) {reject({"errorCode":401, "error":err});}
        if(result) {resolve({"result":result});}
      });
    }
  })
}
module.exports = {verifyJwt}
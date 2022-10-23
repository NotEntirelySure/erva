//allows access to .env file for environment variable declaration
require('dotenv').config();
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const QRCode = require('qrcode');
const Pool = require('pg').Pool
const pool = new Pool({
  user: process.env.API_BASE_USER_ACCOUNT,
  host: process.env.API_BASE_HOST_URL,
  database: process.env.API_BASE_DATABASE_NAME,
  password: process.env.API_BASE_DATABASE_PASSWORD,
  port: process.env.API_BASE_PORT_NUMBER,
});

const login = (loginValues) => {
  return new Promise(async(resolve, reject) => { 
    try {
      const secretRequest = await pool.query(`SELECT convert_from(decrypt(users_otp_key::bytea, '${process.env.DATABASE_PASSWORD_ENCRYPTION_KEY}', 'aes'), 'SQL_ASCII') from users where users_email='${loginValues.user.toLowerCase()}';`);
      if (secretRequest.rows.length === 0) {resolve({"error":401,"message":"authentication error"})}
      if (secretRequest.rows.length > 0) {
        
        const isVerified = speakeasy.totp.verify({
          secret:secretRequest.rows[0].convert_from,
          encoding: 'base32',
          token:loginValues.otp
        });
        
        if (isVerified) {
          try {
            const userInfo = await pool.query(`
              SELECT
                users_id,
                users_first_name,
                users_last_name,
                users_email,
                users_enabled,
                at.at_name
              FROM users
              INNER JOIN accounttypes AS at
              ON users.users_fk_type=at.at_id
              WHERE users_email='${loginValues.user}' AND users_password=crypt('${loginValues.pass}', users_password);`
            )
            if (userInfo.rowCount > 0) {
              if (userInfo.rows[0].users_enabled) {
                const payload = {
                  "id":userInfo.rows[0].users_id,
                  "type":userInfo.rows[0].users_type,
                  "fname":userInfo.rows[0].users_first_name,
                  "lname":userInfo.rows[0].users_last_name,
                  "email":userInfo.rows[0].users_email,
                  "type":userInfo.rows[0].at_name
                }
                const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: "1d"});
                resolve({"jwt":token});
              }
              if (userInfo.rows[0].users_enabled) {resolve({"error":401,"message":"account disabled"})}
            }
            if (userInfo.rowCount === 0) {resolve({"error":401,"message":"authentication error"})}
          }
          catch (err) {resolve({"error":401,"message":"authentication error"})}
        }
        if (!isVerified) {resolve({"error":401,"message":"otp authentication error"})}
      }
    }
    catch (err) {resolve({"error":401,"message":"authentication error 66"})}

   }) 
}

const register = (registrationValues) => {
  return new Promise(function(resolve, reject) {
    const isVerified = speakeasy.totp.verify({
      secret: registrationValues.otpSecret,
      encoding: 'base32',
      token: registrationValues.otp
    });
    if (!isVerified) {resolve({"code":601,"message":"invalid OTP code"})}
    if (isVerified) {
      pool.query(`
        INSERT INTO users (
          users_first_name,
          users_last_name,
          users_email,
          users_password,
          users_created_at,
          users_fk_role,
          users_fk_type,
          users_otp_key,
          users_enabled
        )
        VALUES (
          '${registrationValues.fname}',
          '${registrationValues.lname}',
          '${registrationValues.email.toLowerCase()}',
          crypt('${registrationValues.password}', gen_salt('bf')),
          (SELECT NOW()),
          2,
          4,
          encrypt('${registrationValues.otpSecret}', '${process.env.DATABASE_PASSWORD_ENCRYPTION_KEY}', 'aes'),
          'true'
        );`, (error) => {
          if (error) {reject(error)}
          resolve({"code":200})
      })
    }
  })
}

const generateQr = () => {
  const secret = speakeasy.generateSecret();
  const otpAuthUrl = speakeasy.otpauthURL({ secret: secret.ascii, label: 'Erva', algorithm: 'sha512' });
  return new Promise((resolve, reject) => {
    QRCode.toDataURL(otpAuthUrl, (err, data_url) => {
      if(err) {reject(err)}
      resolve({"qrcode":data_url,"secret":secret});
    });
  })
}

module.exports = {
  generateQr,
  login,
  register
}
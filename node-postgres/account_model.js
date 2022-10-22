const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const QRCode = require('qrcode');
const Pool = require('pg').Pool
const pool = new Pool({
  user: 'superuser',
  host: 'localhost',
  database: 'erva',
  password: 'root',
  port: 5432,
});

const encryptionKey = '_@3w-L2*=5SFhP}p29eyp*ll48Q0io[2'

const login = (username, password, otp, jwtSecret) => {
  return new Promise(async(resolve, reject) => { 
    try {
      const secretRequest = await pool.query(`SELECT convert_from(decrypt(users_otp_key::bytea, '${encryptionKey}', 'aes'), 'SQL_ASCII') from users where users_email='${username.toLowerCase()}';`);
      if (secretRequest.rows.length === 0) {resolve({"error":401,"message":"authentication error"})}
      if (secretRequest.rows.length > 0) {
        
        const isVerified = speakeasy.totp.verify({
          secret:secretRequest.rows[0].convert_from,
          encoding: 'base32',
          token:otp
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
              WHERE users_email='${username}' AND users_password=crypt('${password}', users_password);`
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
                const token = jwt.sign(payload, jwtSecret, {expiresIn: "1d"});
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

const register = (fname, lname, email, password, otp, otpSecret) => {
  return new Promise(function(resolve, reject) {
    const isVerified = speakeasy.totp.verify({
      secret: otpSecret,
      encoding: 'base32',
      token: otp
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
          '${fname}',
          '${lname}',
          '${email.toLowerCase()}',
          crypt('${password}', gen_salt('bf')),
          (SELECT NOW()),
          2,
          4,
          encrypt('${otpSecret}', '${encryptionKey}', 'aes'),
          'true'
        );`, (error, results) => {
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
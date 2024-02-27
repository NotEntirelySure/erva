require("dotenv").config();
const nodemailer = require("nodemailer");
const { GoogleAuth } = require('google-auth-library');
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const OAuth2 = google.auth.OAuth2;
const gmailKeys = require('./emailKeys.json');

async function createTransporter() {
  const oauth2Client = new OAuth2(
    process.env.EMAIL_CLIENT_ID,
    process.env.EMAIL_CLIENT_SECRET,
    "smtp.gmail.com"
  );

  oauth2Client.setCredentials({refresh_token: process.env.EMAIL_REFRESH_TOKEN});

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) reject("failed to create access token");
      resolve(token);
    });
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.EMAIL_FROM_ADDRESS,
      accessToken,
      clientId: process.env.EMAIL_CLIENT_ID,
      clientSecret: process.env.EMAIL_CLIENT_SECRET,
      refreshToken: process.env.EMAIL_REFRESH_TOKEN
    }
  });
  return transporter;
};

async function makeTransporter (toAddress) {
  const client = new OAuth2(
    gmailKeys.web.client_id,
    gmailKeys.web.client_secret,
    gmailKeys.web.redirect_uris
  );
  
  const tokens = await client.getAccessToken();
  console.log(tokens);
  const transporter = nodemailer.createTransport({
    service:'gmail',
    auth: {
      type:'OAuth2',
      user:'c.rosenberg@ervasystems.com',
      clientId: gmailKeys.web.client_id,
      clientSecret: gmailKeys.web.client_secret,
      refreshToken: tokens.res.data.refresh_token,
      accessToken: tokens.token,
      expires: tokens.res.data.expires_in,
    }
  });
  const payload = {
    type:"emailVerification",
    email:toAddress.toLowerCase()
  };
  const verificationToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: "2d"});
  const options = {
    subject: "ERVA Account Verification",
    from: process.env.EMAIL_FROM_ADDRESS,
    to: toAddress.toLowerCase(),
    html: `
      <div>
        <p>Thank you for registering an account with ERVA. Before you can use your account you need to verify your email address</p>
        <p>Click <a href="${process.env.EMAIL_BASE_URL}/verifyaccount?verificationToken=${verificationToken}">here</a> to verify your account.<p>
      </div>
    `
  };
  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);

  } catch (error) {console.error('Error sending email:', error);};
  return true;
};

const sendAccountExistsEmail = async(toAddress) => {
  const options = {
    subject: "ERVA Account Registration",
    from: process.env.EMAIL_FROM_ADDRESS,
    to: toAddress,
    html: `
      <div>
        <p>You are receiving this email because someone attempted to create an account with the email address of ${toAddress}, but an account is already registered with that email address</p>
        <p>If you did not initiate this account registration action, please contact Erva Systems customer service at account-services@ervasystems.com</p>
        <br/>
        <p>If you did initiate this action and forgot your account password, click <a href="${process.env.EMAIL_BASE_URL}/forgotpassword">here</a> to reset your password.
      </div>
    `
  };
  let emailTransporter = await createTransporter();
  await emailTransporter.sendMail(options);
};

async function sendVerifyEmail(toAddress) {
  const payload = {
    type:"emailVerification",
    email:toAddress.toLowerCase()
  };
  const verificationToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: "2d"});
  const options = {
    subject: "ERVA Account Verification",
    from: process.env.EMAIL_FROM_ADDRESS,
    to: toAddress.toLowerCase(),
    html: `
      <div>
        <p>Thank you for registering an account with ERVA. Before you can use your account you need to verify your email address</p>
        <p>Click <a href="${process.env.EMAIL_BASE_URL}/verifyaccount?verificationToken=${verificationToken}">here</a> to verify your account.<p>
      </div>
    `
  };
  const emailTransporter = await createTransporter();
  const sendEmail = await emailTransporter.sendMail(options);
  console.log(sendEmail);
  return true;
};

const sendForgotEmail = async(toAddress, resetToken) => {
  const options = {
    subject: "ERVA Password Reset",
    from: process.env.EMAIL_FROM_ADDRESS,
    to: toAddress,
    html: `
      <div>
        <p>You are receiving this email because a request to reset your password was received by our system. If you did not initiate this request, contact your system administrator.</p>
        <p>Click <a href="${process.env.API_BASE_HOST_URL}/passwordreset?resetToken=${resetToken}">here</a> to reset your account password.<p>
      </div>
    `
  };
  let emailTransporter = await createTransporter();
  await emailTransporter.sendMail(options);
};

module.exports = {
  sendVerifyEmail,
  sendAccountExistsEmail,
  sendForgotEmail,
  makeTransporter
};
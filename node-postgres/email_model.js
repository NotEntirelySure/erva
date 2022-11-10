require("dotenv").config();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.EMAIL_CLIENT_ID,
    process.env.EMAIL_CLIENT_SECRET,
    "smtp.gmail.com"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.EMAIL_REFRESH_TOKEN
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject("failed to create access token");
      }
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

const sendVerifyEmail = async(toAddress, verificationToken) => {
  const options = {
    subject: "ERVA Account Verification",
    from: process.env.EMAIL_FROM_ADDRESS,
    to: toAddress,
    html: `
      <div>
        <p>Thank you for registering an account with ERVA. Before you can use your account you need to verify your email address</p>
        <p>Click <a href="http://${process.env.API_BASE_HOST_URL}:3000/verifyaccount?verificationToken=${verificationToken}">here</a> to verify your account.<p>
      </div>
    `
  }
  let emailTransporter = await createTransporter();
  await emailTransporter.sendMail(options);
};

const sendForgotEmail = async(toAddress, resetToken) => {
  const options = {
    subject: "ERVA Password Reset",
    from: process.env.EMAIL_FROM_ADDRESS,
    to: toAddress,
    html: `
      <div>
        <p>You are receiving this email because a request to reset your password was received by our system. If you did not initiate this request, contact your system administrator.</p>
        <p>Click <a href="http://${process.env.API_BASE_HOST_URL}:3000/passwordreset?resetToken=${resetToken}">here</a> to reset your account password.<p>
      </div>
    `
  }
  let emailTransporter = await createTransporter();
  await emailTransporter.sendMail(options);
};

module.exports = {sendVerifyEmail,sendForgotEmail}
require("dotenv").config();
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const jwt = require("jsonwebtoken");
const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    "smtp.gmail.com"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.REFRESH_TOKEN
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
      user: process.env.FROM_EMAIL,
      accessToken,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN
    }
  });

  return transporter;
};

const sendEmail = async(toAddress, verificationToken) => {
  const options = {
    subject: "ERVA Account Verification",
    from: process.env.FROM_EMAIL,
    to: toAddress,
    html: `
      <div>
        <p>Thank you for registering an account with ERVA. Before you can use your account you need to verify your email address</p>
        <p>Click <a href="http://localhost:3000/verifyaccount?verificationToken=${verificationToken}">here</a> to verify your account.<p>
      </div>
    `
  }
  let emailTransporter = await createTransporter();
  await emailTransporter.sendMail(options);
};

module.exports = {sendEmail}
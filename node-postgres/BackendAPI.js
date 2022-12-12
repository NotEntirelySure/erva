//allows access to .env file for environment variable declaration
require('dotenv').config();

const https = require('https');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const app = express().use('*', cors());

const account_model = require('./account_model');
const admin_model = require('./admin_model');
const verifyJwt_model = require('./verifyJwt_model');
const database_model = require('./database_model');
const email_model = require('./email_model');

app.use(express.json())
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.API_ACCESS_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers');
  next();
});

app.get('/getqr', (req, res) => {
  account_model.generateQr()
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error))
})

app.get('/getusers', (req, res) => {
  admin_model.getUsers()
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error))
})

app.get('/sendemail', (req, res) => {
  email_model.sendEmail()
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error))
})

app.post('/register', (req, res) => {
  account_model.register(req.body)
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error))
})

app.post('/login', (req, res) => {
  account_model.login(req.body)
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error))
})

app.post('/forgotpassword', (req, res) => {
  account_model.forgotPassword(req.body.email)
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error))
})

app.post('/resetpassword', (req, res) => {
  account_model.resetPassword(req.body.resetToken,req.body.newPassword)
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error))
})

app.post('/verifyjwt', (req, res) => {
  verifyJwt_model.verifyJwt(req.body.token)
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error))
})

app.post('/verifyaccount', (req, res) => {
  account_model.verifyAccount(req.body.token)
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error))
})

app.post('/getapikey', (req, res) => {
  account_model.getApiKey(req.body.token)
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error))
})

app.post('/getoffices', (req, res) => {
  database_model.getOffices(req.body.token)
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error))
})

app.post('/getfacilities', (req, res) => {
  database_model.getFacilities(req.body.token, req.body.office)
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error))
})

app.post('/getfacilitymaps', (req, res) => {
  database_model.getFacilityMaps(req.body.token, req.body.facility)
    .then(response => res.status(200).send(response))
    .catch(error => res.status(500).send(error))
})

app.listen(process.env.API_BASE_LISTENING_PORT, () => {
  console.log(`App running on port ${process.env.API_BASE_LISTENING_PORT}.`)
})

// https.createServer(
//   {
//     pfx:fs.readFileSync('C:/ErvaAPI/APICert.pfx'),
//     passphrase:'14ug5YO@vb_=7iXr'
//   },
//   app
// ).listen(process.env.API_BASE_LISTENING_PORT, () => {console.log(`Secure API running on port ${process.env.API_BASE_LISTENING_PORT}.`)})
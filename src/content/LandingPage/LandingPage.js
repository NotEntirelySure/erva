import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Form,
  Link,
  Modal, 
  TextInput
} from '@carbon/react';
import { WarningHex, Login } from '@carbon/react/icons';

import logo from '../../assets/images/logo.jpg'

export default function LandingPage() {

  const navigate = useNavigate();
  const userTextBoxRef = useRef({value:''});
  const passTextBoxRef = useRef({value:''});
  const otpTextBoxRef = useRef({value:''});

  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [errorInfo, setErrorInfo] = useState({heading:'',message:''});
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [inputValidation, setInputValidation] = useState({
    userInvalid:false,
    passInvalid:false,
    otpInvalid:false
  });

  function ValidateForm(form) {
    let valid = true;
    switch (form) {
      case "creds":
        if (userTextBoxRef.current.value === "") { 
          valid = false;
          setInputValidation(previousState => ({...previousState, userInvalid:true}));
        };

        if (passTextBoxRef.current.value === "") {
          valid = false;
          setInputValidation(previousState => ({...previousState, passInvalid:true}));
        };
        if (valid) {
          setLoginModalOpen(false);
          setOtpModalOpen(true);
        };
        break;
      case "otp":
        if (otpTextBoxRef.current.value === "" || isNaN(parseInt(otpTextBoxRef.current.value))) {
          valid = false;
          setInputValidation(previousState => ({...previousState, otpInvalid:true}));
        };
        if (valid) {
          setOtpModalOpen(false);
          LoginUser();
        };
        break;
    };
  };

  async function LoginUser() {
    const loginRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/login`,{
      mode:'cors',
      method:"POST",
      headers: {
        'Content-Type':'application/json',
        Accept:'application/json'
      },
      body:JSON.stringify({
        username:userTextBoxRef.current.value,
        password:passTextBoxRef.current.value,
        otp:parseInt(otpTextBoxRef.current.value)
      })
    });
    const loginResult = await loginRequest.json();
    
    if (loginResult.success) {
      sessionStorage.setItem("ervaJwt",loginResult.jwt);
      navigate('/userpage');
    };
    if (!loginResult.success) {
      userTextBoxRef.current.value = '';
      passTextBoxRef.current.value = ''; 
      otpTextBoxRef.current.value = '';
      setErrorInfo({
        heading:`Error ${loginResult.errorCode}`,
        message:`A login error occured: ${loginResult.errorMessage}`
      });
      setErrorModalOpen(true);
    };
  };

  return (
    <>
      <Modal
        id='ErrorModal'
        size='sm'
        open={errorModalOpen}
        modalLabel='Login Error'
        modalHeading={errorInfo.heading}
        modalAriaLabel='error modal'
        primaryButtonText='Ok'
        onRequestClose={() => {
          setErrorModalOpen(false);
          setTimeout(() => setErrorInfo({heading:'',message:''}),750)
        }}
        onRequestSubmit={() => {
          setErrorModalOpen(false);
          setTimeout(() => setErrorInfo({heading:'',message:''}),750)
        }}
        children={
          <div style={{display:'flex', gap:'1rem', alignContent:'center'}}>
            <div><WarningHex size={28} style={{color:'orange'}}/></div>
            <div>{errorInfo.message}</div>
          </div>
        }
      />
      <Modal
        shouldSubmitOnEnter={true}
        preventCloseOnClickOutside={true}
        open={loginModalOpen}
        size="sm"
        modalHeading="Login"
        primaryButtonText='Continue'
        secondaryButtonText='Cancel'
        onRequestClose={() => {
          setLoginModalOpen(false);
          setInputValidation({
            userInvalid:false,
            passInvalid:false,
            otpInvalid:false
          });
          userTextBoxRef.current.value = '';
          passTextBoxRef.current.value = '';
        }}
        onRequestSubmit={() => {
          ValidateForm("creds");
        }}
        children={
          <Form
            children={
              <>
                <p style={{fontSize:'0.85rem', marginTop:'-0.5rem'}}>Don't have an account? <Link href="/register">Register</Link></p>
                <br/>
                <TextInput
                  id="usernameTextBox"
                  labelText="Username"
                  ref={userTextBoxRef}
                  invalid={inputValidation.userInvalid}
                  invalidText="Please enter a username"
                  onChange={() => {
                    if (inputValidation.userInvalid) setInputValidation(previousState => ({...previousState, userInvalid:false}));
                  }}
                />
                <TextInput.PasswordInput
                  id="passwordTextBox"
                  labelText="Password"
                  ref={passTextBoxRef}
                  invalid={inputValidation.passInvalid}
                  invalidText="Please enter a password"
                  onChange={() => {
                    if (inputValidation.passInvalid) setInputValidation(previousState => ({...previousState, passInvalid:false}));
                  }}
                />
                <div style={{display:'flex', justifyContent:'end'}}>
                  <Link href="/forgotpassword" children={"Forgot Password"}/>
                </div>
              </>
            }
          />
        }
      />
      <Modal
        shouldSubmitOnEnter={true}
        preventCloseOnClickOutside={true}
        open={otpModalOpen}
        size="xs"
        modalHeading="Enter OTP"
        primaryButtonText='Submit'
        secondaryButtonText='Cancel'
        onRequestClose={() => {
          setOtpModalOpen(false);
          setLoginModalOpen(true);
          setInputValidation(previousState => ({...previousState, otpInvalid:false}));
          otpTextBoxRef.current.value = '';
        }}
        onRequestSubmit={() => {ValidateForm("otp");}}
        children={
          <TextInput
            id="otpTextBox"
            labelText="One-Time Password"
            maxCount={6}
            placeholder="XXXXXX"
            enableCounter={true}
            ref={otpTextBoxRef}
            invalid={inputValidation.otpInvalid}
            invalidText="Please enter a valid OTP"
            onChange={() => {
              if (inputValidation.otpInvalid) setInputValidation(previousState => ({...previousState, otpInvalid:false}));
            }}
          />
        }
      />
      <div id="LandingPageContent">
        <div id="imageContainer"><img id='landingPageImage' src={logo}></img></div>
        <div className='buttondiv'>
          <Button
            className='landingPageButton'
            renderIcon={Login}
            children={"Login"}
            onClick={() => setLoginModalOpen(true)}
          />
        </div>
      </div>
    </>
  );
};
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalHeader from '../../components/GlobalHeader/GlobalHeader';
import { isAlpha, isEmail, isInt, isStrongPassword } from 'validator';
import {
  Button, 
  Content,
  Loading,
  Layer,
  Modal,
  ProgressIndicator,
  ProgressStep,
  TextInput,
  SideNavDivider,
  Stack,
  Tile,
} from '@carbon/react';
import { 
  CheckmarkFilled,
  ErrorFilled,
  WarningHex,
  Home,
  LicenseThirdParty,
  QrCode,
  TwoFactorAuthentication,
  UserFollow
} from '@carbon/react/icons';

export default function RegistrationPage() {

  const navigate = useNavigate();
  const firstNameRef = useRef();
  const lastNameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const otpRef = useRef();

  const [qrCode, setQrCode] = useState();
  const [generatingQr, setGeneratingQr] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorInfo, setErrorInfo] = useState({heading:'', message:''});
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [progressControl, setProgressControl] = useState({
    generateComplete:false,
    generateCurrent:true,
    scanComplete:false,
    scanCurrent:false,
    enterOtpComplete:false,
    enterOtpCurrent:false
  });
  const [formValidation, setFormValidation] = useState({
    firstNameInvalid:false,
    lastNameInvalid:false,
    emailInvalid:false,
    passwordInvalid:false,
    confirmPasswordInvalid:false,
    otpInvalid:false
  });
  const [passwordValidation, setPasswordValidation] = useState({
    upperValid:false,
    lowerValid:false,
    numberValid:false,
    specialValid:false,
    lengthValid:false
  });

  async function GetQr() {
    setGeneratingQr(true);
    try {
      const qrRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/getqr`, {mode:'cors'})
      const qrResponse = await qrRequest.json();
      setQrCode(qrResponse)
      setProgressControl(previousState => ({
        ...previousState,
        generateComplete:true,
        generateCurrent:false,
        scanCurrent:true
      }));
    }
    catch (error) {
      setErrorInfo({
        heading: `Error: ${error.message}`,
        message: 'An error occured while generating the QR code. If the problem persists, contact your system administrator.',
      });
      setErrorModalOpen(true);
    };
    setGeneratingQr(false);
  };

  function ValidateForm() {
    const validation = {...formValidation};
    let isValid = true;
    
    if (!isAlpha(firstNameRef.current.value)) {
      validation.firstNameInvalid = true;
      isValid = false;
    };
    
    if (!isAlpha(lastNameRef.current.value)) {
      validation.lastNameInvalid = true;
      isValid = false;
    };

    if (!isEmail(emailRef.current.value)) {
      validation.emailInvalid = true;
      isValid = false;
    };

    if (!isStrongPassword(passwordRef.current.value)) {
      validation.passwordInvalid = true;
      isValid = false;
    };

    if (confirmPasswordRef.current.value !== passwordRef.current.value) {
      validation.confirmPasswordInvalid = true;
      isValid = false;
    };

    if (!isInt(otpRef.current.value) || otpRef.current.value.length < 6) {
      validation.otpInvalid = true;
      isValid = false;
    };

    if (!isValid) setFormValidation(validation);
    if (isValid) Register();
  };

  async function Register() {
    setRegistering(true);
    try {
      const payload = {
        fname:firstNameRef.current.value,
        lname:lastNameRef.current.value,
        email:emailRef.current.value,
        password:passwordRef.current.value,
        confirmPassword:confirmPasswordRef.current.value,
        otp:otpRef.current.value,
        otpsecret:qrCode.secret.base32
      };
      console.log(payload);
      
      const registerRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/register`, {
        method:'POST',
        mode:'cors',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
      });
      const registerResponse = await registerRequest.json();
      if (!registerResponse.success) {
        setErrorInfo({
          heading:'Registration Error',
          message:registerResponse.message
        });
        setErrorModalOpen(true);
      }
      if (registerResponse.success) setRegistrationSuccess(true);
    }
    catch (error) {
      setErrorInfo({
        heading: `Error: ${error.message}`,
        message: 'An error occured while attempting to register your account. If the problem persists, contact your system administrator.',
      });
      setErrorModalOpen(true);
    };
    setRegistering(false);
  };
  return (
    <>
      <GlobalHeader/>
      <Content>
        <Modal
          id='ErrorModal'
          size='sm'
          open={errorModalOpen}
          modalLabel='New User Registration'
          modalHeading={errorInfo.heading}
          modalAriaLabel='error modal'
          primaryButtonText='OK'
          onRequestClose={() => {
            setErrorModalOpen(false);
            setTimeout(() => setErrorInfo(''),750)
          }}
          onRequestSubmit={() => {
            setErrorModalOpen(false);
            setTimeout(() => setErrorInfo(''),750)
          }}
          children={
            <div style={{display:'flex', gap:'1rem', alignContent:'start'}}>
              <div><WarningHex size={28} style={{color:'orange'}}/></div>
              <div>{errorInfo.message}</div>
            </div>
          }
        />
        {registrationSuccess ? 
          <div className="formPositioner">
            <Tile style={{maxWidth:'35rem'}}>
              <Stack gap={4}>
                <div className='formBody'>
                <CheckmarkFilled style={{color:'#24a148'}} size={64}/>
                </div>
                <div>
                  <p className="formHeader">Account Created!</p>
                </div>
                <SideNavDivider/>
              </Stack>
              <Stack gap={10}>
                <p style={{fontFamily:'sans-serif'}}>An email has been sent to the email address you registered with. Please follow the link in the email to verify your account before logging in.</p>
                <div style={{display:'flex',justifyContent:'center'}}>
                  <Button 
                    children={"Home"}
                    renderIcon={Home}
                    onClick={() => navigate("/")}
                  />
                </div>
              </Stack>
          </Tile>
          </div>
          :
          <div style={{display:'flex', flexWrap:'wrap', gap:'2rem', justifyContent:'center'}}>
            <Tile style={{width:'27rem'}}>
              <Stack gap={4}>
                <div className='formBody'>
                  <UserFollow size={64}/>
                </div>
                <div>
                  <p className="formHeader">Registration Information</p>
                </div>
                <SideNavDivider/>
              </Stack>
              <Layer>
                <Stack gap={5}>
                  <TextInput
                    style={{maxWidth:'25rem'}}
                    id='firstNameTextBox'
                    labelText="First Name"
                    ref={firstNameRef}
                    invalid={formValidation.firstNameInvalid}
                    invalidText="This fild cannot be blank or contain special characters"
                    onChange={() => {
                      if (formValidation.firstNameInvalid) setFormValidation(previousState => ({
                        ...previousState,
                        firstNameInvalid:false
                      }));
                    }}
                  />
                  <TextInput
                    style={{maxWidth:'25rem'}}
                    id='lastNameTextBox'
                    labelText="Last Name"
                    ref={lastNameRef}
                    invalid={formValidation.lastNameInvalid}
                    invalidText="This fild cannot be blank or contain special characters"
                    onChange={() => {
                      if (formValidation.lastNameInvalid) setFormValidation(previousState => ({
                        ...previousState,
                        lastNameInvalid:false
                      }));
                    }}
                  />
                  <TextInput
                    style={{maxWidth:'25rem'}}
                    id='emailTextBox'
                    labelText="Email Address"
                    ref={emailRef}
                    invalid={formValidation.emailInvalid}
                    invalidText="Invalid email address"
                    onChange={() => {
                      if (formValidation.emailInvalid) setFormValidation(previousState => ({
                        ...previousState,
                        emailInvalid:false
                      }));
                    }}
                  />
                  <TextInput.PasswordInput
                    id="passwordTextBox"
                    labelText="Password"
                    ref={passwordRef}
                    invalid={formValidation.passwordInvalid}
                    invalidText="The password does not meet the minimum requirements"
                    onChange={() => {
                      if (formValidation.passwordInvalid) setFormValidation(previousState => ({
                        ...previousState,
                        passwordInvalid:false
                      }));

                      /[A-Z]/.test(passwordRef.current.value) ?
                        setPasswordValidation(previousState => ({
                          ...previousState,
                          upperValid:true
                        }))
                        :
                        setPasswordValidation(previousState => ({
                          ...previousState,
                          upperValid:false
                        }));

                      /[a-z]/.test(passwordRef.current.value) ?
                        setPasswordValidation(previousState => ({
                          ...previousState,
                          lowerValid:true
                        }))
                        :
                        setPasswordValidation(previousState => ({
                          ...previousState,
                          lowerValid:false
                        }));

                      /\d/.test(passwordRef.current.value) ?
                        setPasswordValidation(previousState => ({
                          ...previousState,
                          numberValid:true
                        }))
                        :
                        setPasswordValidation(previousState => ({
                          ...previousState,
                          numberValid:false
                        }));

                      /[^\w\s]/.test(passwordRef.current.value) ?
                        setPasswordValidation(previousState => ({
                          ...previousState,
                          specialValid:true
                        })):
                        setPasswordValidation(previousState => ({
                          ...previousState,
                          specialValid:false
                        }));

                      passwordRef.current.value.length >= 8 ?
                        setPasswordValidation(previousState => ({
                          ...previousState,
                          lengthValid:true
                        }))
                        :
                        setPasswordValidation(previousState => ({
                          ...previousState,
                          lengthValid:false
                        }));
                    }}
                  />
                  <div style={{marginTop:'-1rem'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'0.25rem'}}>
                      {passwordValidation.upperValid ? <CheckmarkFilled style={{color:'#24a148'}}/>:<ErrorFilled style={{color:'#da1e28'}}/>}
                      <p className='requirementsText'>At least 1 uppercase letter</p>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:'0.25rem'}}>
                      {passwordValidation.lowerValid ? <CheckmarkFilled style={{color:'#24a148'}}/>:<ErrorFilled style={{color:'#da1e28'}}/>}
                      <p className='requirementsText'>At least 1 lowercase letter</p>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:'0.25rem'}}>
                      {passwordValidation.numberValid ? <CheckmarkFilled style={{color:'#24a148'}}/>:<ErrorFilled style={{color:'#da1e28'}}/>}
                      <p className='requirementsText'>At least 1 number</p>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:'0.25rem'}}>
                      {passwordValidation.specialValid ? <CheckmarkFilled style={{color:'#24a148'}}/>:<ErrorFilled style={{color:'#da1e28'}}/>}
                      <p className='requirementsText'>At least 1 special character</p>
                    </div>
                    <div style={{display:'flex', alignItems:'center', gap:'0.25rem'}}>
                      {passwordValidation.lengthValid ? <CheckmarkFilled style={{color:'#24a148'}}/>:<ErrorFilled style={{color:'#da1e28'}}/>}
                      <p className='requirementsText'>At least 8 characters in lengeth</p>
                    </div>
                  </div>
                  <TextInput.PasswordInput
                    id="confirmTextBox"
                    labelText="Confirm Password"
                    ref={confirmPasswordRef}
                    invalid={formValidation.confirmPasswordInvalid}
                    invalidText="Password does not match."
                    onChange={() => {
                      if (formValidation.confirmPasswordInvalid) setFormValidation(previousState => ({
                        ...previousState,
                        confirmPasswordInvalid:false
                      }));
                    }}
                  />
                </Stack>
              </Layer>
            </Tile>
            <Tile>
              <Stack gap={4}>
                <div className='formBody' style={{minWidth:'25rem'}}>
                  <TwoFactorAuthentication size={64}/>
                </div>
                <div>
                  <p className="formHeader">Setup Two Factor Authentication</p>
                </div>
                <SideNavDivider/>
                <Stack gap={6}>
                  <div>
                    <ProgressIndicator vertical spaceEqually={false}>
                      <div className='progressItem'>
                        <ProgressStep 
                          complete={progressControl.generateComplete}
                          current={progressControl.generateCurrent} 
                          label="Generate QR Code"/>
                        <Button 
                          renderIcon={QrCode}
                          children={
                            generatingQr ?
                              <>
                                <div style={{display:'flex',gap:'0.5rem'}}> 
                                  <Loading withOverlay={false} small={true}/>
                                  <div>Generate</div>
                                </div>
                              </>
                              :
                              "Generate"
                          }
                          onClick={() => GetQr()}
                        />
                      </div>
                      <div className='progressItem'>
                        <ProgressStep
                          current={progressControl.scanCurrent}
                          complete={progressControl.scanComplete}
                          label="Scan QR Code"/>
                        <img src={qrCode?.qrcode} alt=""/>
                      </div>
                      <div className='progressItem'>
                        <ProgressStep 
                          current={progressControl.enterOtpCurrent}
                          complete={progressControl.enterOtpComplete}
                          label="Enter One Time Password"/>
                        <Layer>
                          <TextInput
                            id="otpBox"
                            placeholder="XXXXXX"
                            maxCount={6}
                            enableCounter={true}
                            labelText="One-Time Password"
                            ref={otpRef}
                            invalid={formValidation.otpInvalid}
                            invalidText="Please enter a valid OTP"
                            onChange={event => {
                              if (progressControl.scanCurrent) {
                                setProgressControl(previousState => ({
                                  ...previousState,
                                  scanComplete:true,
                                  scanCurrent:false,
                                  enterOtpCurrent:true
                                }));
                              }
                              if (formValidation.otpInvalid) setFormValidation(previousState => ({...previousState, otpInvalid:false}));
                              if (event.target.value.length === 6) setProgressControl(previousState => ({
                                ...previousState,
                                enterOtpComplete:true,
                                enterOtpCurrent:false
                              }));
                            }}
                          />
                        </Layer>
                      </div>
                    </ProgressIndicator>
                  </div>
                  <Button
                    renderIcon={LicenseThirdParty}
                    children={
                      registering ?
                        <>
                          <div style={{display:'flex',gap:'0.5rem'}}> 
                            <Loading withOverlay={false} small={true}/>
                            <div>Register</div>
                          </div>
                        </>
                        :
                        "Register"
                    }
                    onClick={() => ValidateForm()}
                  />
                </Stack>
              </Stack>
              </Tile>
          </div> 
        }
      </Content>
    </>
  );
};

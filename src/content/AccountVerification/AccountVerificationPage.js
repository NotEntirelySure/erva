import React, {useState, useEffect} from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import {Button, message, Result} from 'antd';
import GlobalHeader from "../../components/GlobalHeader";

export default function AccountVerificationPage() {

  const [tokenParam, setTokenPeram] = useSearchParams();
  const [verificationResult, setVerificationResult] = useState({code:null});
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    message.loading({content:'Verifying Account...',key:'verifyMessage',duration:0});
    verifyAccount();
  },[]);
  
  useEffect(() => {ShowVerificationResult()},[verificationResult])
  
  const verifyAccount = async() => {
    const verifyRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/verifyaccount`, {
      method:'POST',
      mode:'cors',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({token:tokenParam.get("verificationToken")})
    });
    const verifyResponse = await verifyRequest.json();
    setVerificationResult(verifyResponse);
  }
  
  const ShowVerificationResult = () => {
    let status, title, subtitle, extra;
    
    switch (verificationResult.code) {
      case 200:
        status = "success";
        title="Account Verified!";
        subtitle="Your account was sucessfully verified. Please proceed to the login page to login to your account.";
        extra = [
          <Button
            type="primary" 
            onClick={() => setRedirect(true)}
            key="loginButton"
          >
            Login
          </Button>
        ]
        break;
      case 403:
        status="error"
        title="403: Token Expired"
        subtitle=verificationResult.error
        break;
      case 498:
        status="error"
        title="498: Invalid Token"
        subtitle=verificationResult.error
        break;
      case 500:
       status="error"
       title="Error"
       subtitle=verificationResult.error
       break;
      default: return <><div></div></>
    }
    message ? message.destroy("verifyMessage"):<></>;
    return (
      <>
        <div>
          <Result
            status={status}
            title={title}
            subTitle={subtitle}
            extra={extra}
          />
        </div>
      </>
    )
  }
  return (
    <>
      <div>
        {redirect ? <Navigate to="/login"/>:null}
        <GlobalHeader/>
        <ShowVerificationResult/>
      </div>
    </>
  )
}
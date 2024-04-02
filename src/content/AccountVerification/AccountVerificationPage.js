import React, {useState, useEffect} from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import GlobalHeader from "../../components/GlobalHeader/GlobalHeader";
import { 
  ActionableNotification,
  Content,
  Loading,
  SideNavDivider,
  Stack,
  Tile
} from '@carbon/react';
import { UserAdmin } from '@carbon/react/icons';

export default function AccountVerificationPage() {
  
  const navigate = useNavigate()
  const [ tokenParam ] = useSearchParams();
  const [verificationActive, setVerificationActive] = useState(true);
  const [verificationResult, setVerificationResult] = useState({
    status:'',
    title:'',
    message:''
  });

  useEffect(() => {VerifyAccount();},[]);
  
  async function VerifyAccount() {
    setVerificationActive(true);
    const verifyRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/verifyaccount`, {
      method:'POST',
      mode:'cors',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({token:tokenParam.get("verificationToken")})
    });
    const verifyResponse = await verifyRequest.json();
    if (!verifyResponse.success) {
      setVerificationResult({
        status:'error',
        title:'Verification Error!',
        message:verifyResponse.error
      });
    };
    if (verifyResponse.success) {
      setVerificationResult({
        status:'success',
        title:"Success!",
        message:"Your account was sucessfully verified."
      });
    };
    setVerificationActive(false);
  };
  
  return (
    <>
      <Content>
        <GlobalHeader/>
        <div className="formPositioner">
          <Tile style={{width:'22rem', height:'23rem'}}>
            <Stack gap={4}>
              <div className='formBody'>
                <UserAdmin size={64}/>
              </div>
              <div>
                <p className="formHeader">Account Verification</p>
              </div>
              <SideNavDivider/>
            </Stack>
              <div style={{display:'flex', justifyContent:'center',marginTop:'1rem'}}>
                <div style={{display:'flex', gap:'0.5rem', alignItems:'center'}}>
                  {
                    verificationActive ? 
                      <>
                        <Loading small={true} withOverlay={false}/>
                        <p>Verifying Account...</p>
                      </>
                      :
                      <ActionableNotification
                      actionButtonLabel={verificationResult.status === "success" ? "Login":"Retry"}
                      kind={verificationResult.status}
                      hideCloseButton={true}
                      onActionButtonClick={() => {
                        if (verificationResult.status === "success") navigate("/");
                        else {VerifyAccount()}
                      }}
                      statusIconDescription="notification"
                      title={verificationResult.title}
                      subtitle={verificationResult.message}
                      />
                  }
                </div>
              </div>
          </Tile>
        </div>
      </Content>
    </>
  );
};
import React, {useEffect, useState, useRef} from "react";
import {Buffer} from 'buffer';
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Button,
  Content,
  Layer,
  Loading,
  Modal,
  SideNavDivider,
  Stack,
  TextInput,
  Tile
} from '@carbon/react';
import { Password, Send } from '@carbon/react/icons';
import GlobalHeader from "../../components/GlobalHeader/GlobalHeader";

export default function PasswordResetPage() {
  
  const [ tokenParam ] = useSearchParams();
  const navigate = useNavigate();
  const resetToken = useRef();
  const newPasswordRef = useRef();
  const confirmPasswordRef = useRef();

  const [newInvalid, setNewInvalid] = useState(false);
  const [newInvalidMessage, setNewInvalidMessage] = useState('');
  const [confirmInvalid, setConfirmInvalid] = useState(false);
  const [confirmInvalidMessage, setConfirmInvalidMessage] = useState('');
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestResult, setRequestResult] = useState({status:'',message:''});
  const [buttonDescription, setButtonDescription] = useState('Reset Password');
  
  useEffect(() => {resetToken.current = tokenParam.get("resetToken")},[]);
  
  function ValidateForm() {
    if (!newPasswordRef.current.value) {
      setNewInvalid(true);
      setNewInvalidMessage('New password cannot be blank.');
      return;
    };
    if (!confirmPasswordRef.current.value) {
      setConfirmInvalid(true);
      setConfirmInvalidMessage('Confirmation password cannot be blank.')
      return;
    };
    if (newPasswordRef.current.value !== confirmPasswordRef.current.value) {
      setConfirmInvalid(true);
      setNewInvalid(true);
      setNewInvalidMessage('Passwords do not match.');
      setConfirmInvalidMessage('Passwords do not match.');
      return;
    };
    ResetPassword();
    
  };

  async function ResetPassword() {
    setButtonDescription(
      <>
        <Loading withOverlay={false} small={true}/>
        <div style={{paddingLeft:'0.5rem'}}>Submitting...</div>
      </>
    );
    try {
      const resetRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/resetpassword`, {
      method:'POST',
      mode:'cors',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        "resetToken":resetToken.current,
        "newPassword":newPasswordRef.current.value,
        "confirmPassword":confirmPasswordRef.current.value
      })
    });
    const resetResponse = await resetRequest.json();
    if (!resetResponse.success) {
      setRequestResult({
        status:"Password Reset Error",
        message:resetResponse.message
      });
    };
    if (resetResponse.success) {
      setRequestResult({
        status:"Success",
        message:resetResponse.message
      });
    }
  }
  catch (error) {
    if (error.message === "Failed to fetch") {
      setRequestResult({
        status:"Failed to fetch",
        message:"A network error occured while attemting to change your password. Your password was not reset."
      });
    }
    else {
      setRequestResult({
        status:"Password Reset Error",
        message:"An unexpected error occured while attemting to change your password."
      });
    };
  };
    setButtonDescription("Reset Password");
    setRequestModalOpen(true);
  };

  return (
    <>
    <GlobalHeader/>
    <Content>    
      <Modal
        modalHeading={requestResult.status}
        modalLabel="Reset Password"
        primaryButtonText="OK"
        size='sm'
        open={requestModalOpen}
        children={requestResult.message}
        onRequestSubmit={() => {
          setRequestModalOpen(false)
          if (requestResult.status === "Success") navigate('/');
        }}
        onRequestClose={() => {
          setRequestModalOpen(false)
          if (requestResult.status === "Success") navigate('/');
        }}
      />
      <div className="formPositioner">
        <Tile>
          <Stack gap={4}>
            <div className='formBody'>
              <Password size={64}/>
            </div>
            <div>
              <p className="formHeader">Reset Password</p>
            </div>
            <SideNavDivider/>
          </Stack>
          <Stack gap={6}>
            <Layer>
              <TextInput.PasswordInput
                style={{width:'20rem'}}
                id='newPassword'
                labelText="New Password"
                helperText=""
                placeholder="Enter a new password"
                ref={newPasswordRef}
                invalid={newInvalid}
                invalidText={newInvalidMessage}
                onChange={() => {
                  if (newInvalid) {
                    setNewInvalid(false);
                    setNewInvalidMessage('');
                  };
                }}
              />
              </Layer>
              <Layer>
              <TextInput.PasswordInput
                style={{width:'20rem'}}
                id='confirmPassword'
                labelText="Confirm Password"
                helperText=""
                placeholder="Re-enter your new password"
                ref={confirmPasswordRef}
                invalid={confirmInvalid}
                invalidText={confirmInvalidMessage}
                onChange={() => {
                  if (confirmInvalid) {
                    setConfirmInvalid(false);
                    setConfirmInvalidMessage('');
                  };
                }}
              />
              </Layer>
              <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
              <div>
                <Button
                  renderIcon={Send}
                  children={buttonDescription}
                  onClick={() => ValidateForm()}
                />
              </div>
            </div>
          </Stack>
        </Tile>
      </div>
    </Content>
    </>
  );
};
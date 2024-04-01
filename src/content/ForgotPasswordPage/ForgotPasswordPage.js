import React, { useState, useRef, useContext } from "react";
import { DataContext } from "../../components/DataContext/DataContext";
import GlobalHeader from "../../components/GlobalHeader/GlobalHeader";

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
import { Help, Send } from '@carbon/react/icons';

export default function ForgotPasswordPage() {

  const textBoxRef = useRef();
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [invalidMessage, setInvalidMessage] = useState('');
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [buttonDescription, setButtonDescription] = useState('Submit')
  const [requestResult, setRequestResult] = useState({status:'',message:''});

  function ValidateForm() {
    if (!textBoxRef.current.value) {
      setInvalidMessage("This is a required field.");
      setEmailInvalid(true);
      return;
    }
    if (textBoxRef.current.value.indexOf('@') === -1){
      setInvalidMessage("Invalid email address. The address must contain a @");
      setEmailInvalid(true);
      return;
    }
    SubmitRequest();
  }

  async function SubmitRequest() {
    setButtonDescription(
      <>
        <Loading withOverlay={false} small={true}/>
        <div style={{paddingLeft:'0.5rem'}}>Submitting...</div>
      </>
    );
    try {
      const resetRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/forgotpassword`, {
        method:'POST',
        mode:'cors',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({email:textBoxRef.current.value})
      });
      textBoxRef.current.value = '';
      const resetResponse = await resetRequest.json();
      setRequestResult({
        status:"Request Submitted",
        message:resetResponse.message
      });
    }
    catch (error) {
      if (error.message === "Failed to fetch") {
        setRequestResult({
          status:"Failed to fetch",
          message:"A network error occured while attemting to submit your request. Your request was not sent."
        });
      }
      else {
        setRequestResult({
          status:"Request Submission Error",
          message:"An unexpected error occured while attemting to change your password."
        });
      };
    };
    setButtonDescription("Submit");
    setRequestModalOpen(true);
  };

  return (
    <>
      <GlobalHeader/>
      <Content>
        <Modal
          modalHeading={requestResult.status}
          modalLabel="Forgot Password"
          primaryButtonText="OK"
          size='sm'
          open={requestModalOpen}
          children={requestResult.message}
          onRequestSubmit={() => setRequestModalOpen(false)}
          onRequestClose={() => setRequestModalOpen(false)}
        />
        <div className="formPositioner">
          <Tile>
            <Stack gap={4}>
              <div className='formBody'>
                <Help size={64}/>
              </div>
              <div>
                <p className="formHeader">Forgot Password</p>
              </div>
              <SideNavDivider/>
            </Stack>
            <Stack gap={6}>
              <Layer>
                <TextInput
                  style={{width:'20rem'}}
                  id='emailTextBox'
                  labelText="Email Address"
                  helperText="Enter the email address associated with your account."
                  ref={textBoxRef}
                  invalid={emailInvalid}
                  invalidText={invalidMessage}
                  onChange={() => {
                    if (emailInvalid) setEmailInvalid(false)
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
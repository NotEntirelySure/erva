import React, {useEffect, useState} from "react";
import {Buffer} from 'buffer/';
import { Navigate, useSearchParams } from "react-router-dom";
import {
  Avatar,
  Button,
  Form,
  Input,
  Result,
  Typography
} from "antd";
import {LockOutlined} from '@ant-design/icons';
import GlobalHeader from "../../components/GlobalHeader";

export default function PasswordResetPage() {

  const {Title} = Typography;
  const [tokenParam, setTokenPeram] = useSearchParams();
  const [resetToken, setResetToken] = useState("");
  const [userEmail, setUserEmail] = useState("")
  const [redirect, setRedirect] = useState(false);
  const [showRestForm, setShowResetForm] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [resetResult, setResetResult] = useState({
    "status":null,
    "title":"",
    "subtitle":"",
    "extra":[]
  });
  
  useEffect(() => {setResetToken(tokenParam.get("resetToken"))},[]);
  useEffect(() => { 
    if (resetToken){
      const base64Payload = resetToken.split('.')[1];
      if (!base64Payload) {
        setResetResult({
          "status":"error",
          "title":"500: Reset Token Error",
          "subtitle":"An error occured while processing your password reset token.",
          "extra":[]
        })
        setShowResetForm(false)
        setShowResults(true)
      }
      if (base64Payload) {
        const jsonPayload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
        if (jsonPayload.userEmail) setUserEmail(jsonPayload.userEmail);
        if (!jsonPayload.userEmail) setUserEmail("email undefined");
      }
    }
  },[resetToken])
  useEffect(() => {
    if (resetResult.status !== null) {
      setShowResetForm(false)
      setShowResults(true)
    }
  },[resetResult])
  
  const onFinish = async(values) => {
    const resetRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/resetpassword`, {
      method:'POST',
      mode:'cors',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        "resetToken":resetToken,
        "newPassword":values.password
      })
    });
    const resetResponse = await resetRequest.json();
    if (!resetResponse.error) {
      setResetResult({
        status:"success",
        title:"Success!",
        subtitle:"Your password was successfuly reset.",
        extra:[
          <Button
          type="primary" 
          onClick={() => setRedirect(true)}
          key="loginButton"
          >
          Login
        </Button>
      ]
      })
    }
    if (resetResponse.error) {
      setResetResult({
        "status":"error",
        "title":`Error ${resetResponse.code}`,
        "subtitle":resetResponse.error,
        "extra":[]
      })
    }
  }

  const onFinishFailed = () => {}
  return (
    <>
      {redirect ? <Navigate to="/login"/>:null}
      <GlobalHeader/>
      {
        showRestForm ? 
          <>
            <div className="formPositioner">
              <div className="formContainer">
                <div className='formHeader'>
                  <Avatar
                    style={{backgroundColor:'#2A90FA'}}
                    size={64}
                    icon={<LockOutlined />}
                  />
                </div>
                <div className="formHeader"><Title>Password Reset</Title></div>
                <div className="formHeader"><p>{userEmail}</p></div>
                <div className='formBody'>
                  <Form
                    name="reset form"
                    labelCol={{span:8}}
                    wrapperCol={{span:16}}
                    initialValues={{remember:false}}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    autoComplete="off"
                    >
                    <Form.Item
                    label="New Password "
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: 'Please input your password!',
                      },
                    ]}
                    hasFeedback
                    >
                    <Input.Password />
                  </Form.Item>
                  <Form.Item
                    label="Confirm Password "
                    name="confirm"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                      {
                        required: true,
                        message: 'Please confirm your password!',
                      },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          
                          return Promise.reject(new Error('The two passwords that you entered do not match!'));
                        },
                      }),
                    ]}
                    >
                    <Input.Password />
                  </Form.Item>
                    <Form.Item
                      wrapperCol={{
                        offset: 8,
                        span: 16
                      }}
                      >
                      <Button type="primary" htmlType="submit">
                        Reset Password
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              </div>
            </div>
          </> :null
      }
      {
        showResults ? <div>
          <Result
            status={resetResult.status}
            title={resetResult.title}
            subTitle={resetResult.subtitle}
            extra={resetResult.extra}
          />
        </div>:null
      }
    </>
  )

}
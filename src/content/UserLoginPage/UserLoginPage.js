import React, { useState } from 'react';
import {
  Avatar, 
  Button,
  Divider,
  Form,
  Input,
  message,
  Modal,
  PageHeader
} from 'antd';
import { LockOutlined, LoginOutlined, UserOutlined } from '@ant-design/icons';
import { Link, Navigate } from 'react-router-dom';
import GlobalHeader from '../../components/GlobalHeader'
import SiteFooter from '../../components/SiteFooter/SiteFooter';

const UserLoginPage = () => {

  const [form] = Form.useForm();
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [userCredentials, setUserCredientials] = useState({});
  const [otpValue, setOtpValue] = useState();

  const onFinish = async(values) => {
    setUserCredientials({"username":values.username, "pass":values.password});
    setOtpModalOpen(true);
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  const login = async() => {
    setOtpModalOpen(false);
    message ? message.destroy("loginMessage"):<></>;
    message.loading({content:'Logging in...',key:'loginMessage',duration:0});
    
    const payload = {
      "user":userCredentials.username,
      "pass":userCredentials.pass,
      "otp":otpValue
    }
    setOtpValue("");
    try {
      const authRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/login`, {
        method:'POST',
        mode:'cors',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify(payload)
      });
      const authResponse = await authRequest.json();
    
      
      if (authResponse.jwt) {
        sessionStorage.setItem("jwt",authResponse.jwt);
        setLoginSuccess(true);
        message.destroy('loginMessage');
      }
      if (authResponse.error) {userError(authResponse.error);}
    }
    catch {
      message ? message.destroy("loginMessage"):<></>;
      Modal.error({
        title: 'Authentication Error',
        content: 'An error occured when attempting to log you in. Please try again. If the problem persists, please contact your system administrator.',
      });
    }
  }

  const userError = (errorCode) => {
    message.destroy('loginMessage');
    switch (errorCode) {
      case 401:
        return Modal.error({
          title: 'Authentication Error',
          content: 'The username, password, or one time password provided is incorrect. Please check the information and try again.',
        });
      case 402:
        return Modal.error({
          title: 'Account Disabled',
          content: 'Your account has been disabled. Please contact your system adminstrator for assistance',
        });
      case 601:
        return Modal.error({
          title: 'Not Verified',
          content: 'Your account has not been verified yet. Please verify your account thourgh the email sent to your email address.',
        });
    }
  }

  return (
    <>
      <Modal
        centered
        width={300}
        title="Enter One Time Password"
        visible={otpModalOpen}
        onOk={() => login()}
        onCancel={() => {
          setOtpModalOpen(false);
          setOtpValue("");
        }}
      >
        <div style={{maxWidth:'200px', margin:'auto'}}>

        <Form
          form={form}
          name="register"
          scrollToFirstError
          >
          <Input 
            id="otpInput" 
            allowClear
            maxLength={6}
            size='small'
            value={otpValue}
            onChange={(event) => {setOtpValue(event.target.value)}}
            onPressEnter={() => login()}
            />
        </Form>
            </div>
      </Modal>
      <GlobalHeader/>
      {loginSuccess ? <Navigate to="/userpage"/>:null}
      <div className='formPositioner'>
        <div className='formContainer'>
          <div className='formHeader'>
            <Avatar
              style={{backgroundColor:'#2A90FA'}}
              size={64}
              icon={<UserOutlined />}
              />
          </div>
          <div className='formHeader'><PageHeader title={"Login"}/></div>
          <Divider/>
          <div className='formBody'>
            <Form
              name="login form"
              initialValues={{remember:true}}
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
              >
              <Form.Item
                rules={[{
                  required: true,
                  message: 'Username is a required field',
                }]}
              >
                <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Username" />
              </Form.Item>

              <Form.Item
                rules={[{
                  required: true,
                  message: 'Password is a required field',
                }]}
                >
                <Input
                  prefix={<LockOutlined className="site-form-item-icon" />}
                  type='password'
                  placeholder='Password'
                />
                
              </Form.Item>
              <Form.Item
                wrapperCol={{
                  offset: 8,
                  span: 16
                }}
                >
                <Button type="primary" htmlType="submit">
                  Login <LoginOutlined />
                </Button>
              </Form.Item>
            </Form>
          </div>
          <div style={{display:'flex',justifyContent:"center",gap:'5rem'}}>
            <Link to={'/forgotpassword'}>Forgot password</Link>
            <Link to={'/register'}>Create Account</Link>
          </div>
        </div>
      </div>
      <SiteFooter/>
    </>
  );
};

export default UserLoginPage;
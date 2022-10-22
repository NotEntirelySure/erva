import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import GlobalHeader from '../../components/GlobalHeader';
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Modal,
  Result,
  Row,
  Typography,
  Select
} from 'antd';
const { Option } = Select;

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 8,
    },
  },
  wrapperCol: {
    xs: {
      span: 24,
    },
    sm: {
      span: 16,
    },
  },
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0,
    },
    sm: {
      span: 16,
      offset: 8,
    },
  },
};

const RegistrationPage = () => {
  const [form] = Form.useForm();
  const {Title} = Typography;
  const [qrCode, setQrCode] = useState([]);
  const [redirect, setRedirect] = useState(false);
  const [otpStatus, setOtpStatus] = useState();
  const [displaySuccess, setDisplaySuccess] = useState("none");
  const [displayForm, setDisplayForm] = useState("flex");

  const onFinish = async(values) => {
    
    const registerRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/register`, {
      method:'POST',
      mode:'cors',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        "fname":values.fname,
        "lname":values.lname,
        "email":values.email,
        "password":values.password,
        "otp":values.otp,
        "otpsecret":qrCode.secret.base32
      })
    })
    const registerResponse = await registerRequest.json();

    if (registerResponse.code === 601) {
      Modal.error({
        title: 'One Time Password Invalid',
        content: 'The one time password supplied does not match the current QR code. Please check that the one time password is correct and try again.',
      });
      setOtpStatus("error")
    }
    if (registerResponse.code === 200) {
      setDisplayForm("none");
      setDisplaySuccess("block");
    }
  };

  const getQr = async() => {
    const qrRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/getqr`, {mode:'cors'})
    const qrResponse = await qrRequest.json();
    setQrCode(qrResponse)
  }
  
  const showAgreement = async() => {
    const agreementRequest = await fetch(`${process.env.PUBLIC_URL}/UserAgreement.txt`)
    const agreementResponse = await agreementRequest.text()
    Modal.info({
      title: 'User Agreement',
      width:'40%',
      content: (
        <div>
          <p>{agreementResponse}</p>
        </div>
      ),
      onOk() {}
    });
  }

  return (
    <>
      <GlobalHeader searchEnabled={false}/>
      <div className="registrationForm" ><Title>Account Registration</Title></div>
      <div className="registrationForm" style={{display: displayForm}}>
        <Form
        {...formItemLayout}
        form={form}
        name="register"
        onFinish={onFinish}
        scrollToFirstError
        >
        <Form.Item
          label="First Name"
          name="fname"
          rules={[{
            required: true,
            message: 'First name is a required field',
          }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Last Name"
          name="lname"
          rules={[{
            required: true,
            message: 'Last name is a required field',
          }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="E-mail"
          rules={[
            {
              type: 'email',
              message: 'The input is not valid E-mail!',
            },
            {
              required: true,
              message: 'Please input your E-mail!',
            },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="password"
          label="Password"
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
          name="confirm"
          label="Confirm Password"
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

        <Form.Item label="2FA" extra="Setup two-factor authentication.">
          <Row gutter={8}>
            <Col span={12}>
              <Form.Item
                name="otp"
                noStyle
                rules={[
                  {
                    required: true,
                    message: 'Please input your 2FA code',
                  },
                ]}
              >
                <Input 
                  status={otpStatus}
                  onChange={() => {if (otpStatus === "error") {setOtpStatus("")}}}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Button onClick={() => getQr()}>Get QR Code</Button>
            </Col>
          </Row>
          <Row>
          <img src={qrCode.qrcode} alt=""/>
          </Row>
        </Form.Item>

        <Form.Item
          name="agreement"
          valuePropName="checked"
          rules={[
            {
              validator: (_, value) =>
                value ? Promise.resolve() : Promise.reject(new Error('You must accept the license agreement to create an account.')),
            },
          ]}
          {...tailFormItemLayout}
        >
          <Checkbox>
            I have read the <a onClick={() => {showAgreement()}}>agreement</a>
          </Checkbox>
        </Form.Item>
        <Form.Item {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit">
            Register
          </Button>
        </Form.Item>
      </Form>
      </div>
      <div style={{display:displaySuccess}}>
        {redirect ? <Navigate to="/login"/>:null}
        <Result
          status="success"
          title="Account Created!"
          subTitle="Your account has been successfully created. Please login to your newly created account."
          extra={[
            <Button 
              type="primary" 
              onClick={() => setRedirect(true)}
              key="loginButton"
            >
              Login
            </Button>
          ]}
        />
      </div>
    </>
  );
};

export default RegistrationPage;
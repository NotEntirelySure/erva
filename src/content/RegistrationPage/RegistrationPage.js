import React, { useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import GlobalHeader from '../../components/GlobalHeader';
import SiteFooter from '../../components/SiteFooter/SiteFooter';
import {
  Avatar,
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  Modal,
  Result,
  Row,
  Select,
  Divider,
  PageHeader,
  Carousel,
  Spin
} from 'antd';
import {ArrowRightOutlined, LoadingOutlined, UserAddOutlined} from '@ant-design/icons';
const { Option } = Select;

const formItemLayout = {
  labelCol: {
    xs: {span: 24},
    sm: {span: 8}
  },
  wrapperCol: {
    xs: {span: 24},
    sm: {span: 16}
  }
};
const tailFormItemLayout = {
  wrapperCol: {
    xs: {span:24, offset:0},
    sm: {span: 16, offset: 8}
  }
};

const RegistrationPage = () => {
  const [form] = Form.useForm();
  const [qrCode, setQrCode] = useState([]);
  const [generatingQr, setGeneratingQr] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [otpStatus, setOtpStatus] = useState();
  const [displaySuccess, setDisplaySuccess] = useState("none");
  const [displayForm, setDisplayForm] = useState("block");
  const [showNextSteps, setShowNextSteps] = useState('none');

  const carouselRef = useRef();

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

    switch (registerResponse.code) {
      case 200:
        setDisplayForm("none");
        setDisplaySuccess("block");
        break;
      case 601:
        Modal.error({
          title: 'One Time Password Invalid',
          content: 'The one time password supplied does not match the current QR code. Please check that the one time password is correct and try again.',
        });
        setOtpStatus("error")
        break;
    }
  };

  const onFinishFailed = (errorInfo) => {
    for (let i=0;i<errorInfo.errorFields.length;i++){
      //the only error value on tile 2 is "otp". If any of the error names are not otp then we know it's on the first tile, so snap back to that tile.
      if (errorInfo.errorFields[i].name[0] !== "otp") {
        carouselRef.current.goTo(0)
        break;
      }
    }
  }

  const getQr = async() => {
    setGeneratingQr(true);
    try{
      const qrRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/getqr`, {mode:'cors'})
      const qrResponse = await qrRequest.json();
      setQrCode(qrResponse)
      setShowNextSteps('block');
      setGeneratingQr(false);
    }
    catch (error){
      setGeneratingQr(false);
      Modal.error({
        title: `Error: ${error.message}`,
        content: 'An error occured while generating QR code. Please contact your system administrator.',
      });
    }
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

  const TileOne = () => {
    return (
      <>
        <div className='tileContent'>
          <Avatar
            style={{backgroundColor:'#2A90FA'}}
            size={56}
            icon={<UserAddOutlined />}
          />
        </div>
        <PageHeader className='tileContent' title="Account Registration"/>
        <Divider/>
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
          label="E-mail"
          name="email"
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
          label="Password"
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
          label="Confirm Password"
          name="confirm"
          dependencies={['password']}
          hasFeedback
          rules={[
            {
              required: true,
              message: 'Please confirm your password!'
            },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          id='userAgreement'
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
        <Form.Item>
          <div style={{marginLeft:'100%'}}>
          <Button onClick={()=>carouselRef.current.next()} type="primary" >
            Next <ArrowRightOutlined />
          </Button>

          </div>
        </Form.Item>   
      </>
    )
  }
  const TileTwo = () => {
    return (
      <>
        <PageHeader onBack={()=>carouselRef.current.prev()} title={"Setup Two-Factor Authentication"}/>
        <Divider/>
        <Form.Item>
          <Row>
            <Col span={15}>
              <p><strong>Step 1:</strong> Generate 2FA QR code</p>
            </Col>
            <Col span={6}>
              <Button onClick={() => getQr()}>
                { 
                  generatingQr ? 
                    <Spin 
                      indicator={
                        <LoadingOutlined 
                          style={{fontSize:20}}
                          spin
                        />
                      }
                      tip="Generating..."
                    />:
                    "Generate" 
                }
              </Button>
            </Col>
          </Row>
        </Form.Item>
        <Form.Item>
          <div style={{display:showNextSteps}}>
            <p><strong>Step 2:</strong> Scan QR code</p>
            <div style={{marginLeft:'50%'}}>

            <img src={qrCode.qrcode} alt=""/>
            </div>
          </div>
        </Form.Item>
          <div style={{display:showNextSteps}}>
            <Row>
              <Col span={8}>
                <p><strong>Step 3:</strong> Enter 2FA code</p>
              </Col>
              <Col span={6}>
                <Form.Item 
                  name="otp"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your 2FA code'
                    }
                  ]}
                >
                  <Input
                    status={otpStatus}
                    onChange={() => {if (otpStatus === "error") {setOtpStatus("")}}}
                  />
                </Form.Item>
              </Col>
            </Row>
          </div>
        <Form.Item {...tailFormItemLayout}>
          <Button type="primary" htmlType="submit">
            Register
          </Button>
        </Form.Item>
      </>
    )
  }

  return (
    <>
      <GlobalHeader searchEnabled={false}/>
      <div style={{display: displayForm}}>
            <Form
            {...formItemLayout}
            form={form}
            name="register"
            labelCol={{flex: '140px'}}
            labelAlign="right"
            onFinish={onFinish}
            onFinishFailed={(error)=>onFinishFailed(error)}
            scrollToFirstError
            >
              <Carousel 
                ref={carouselRef}
                draggable={false}
                swipe={false}
                dots={false}
              >
                <div>
                  <div className='tileContainer'>
                    <TileOne/>
                  </div>
                </div>
                <div>
                  <div className='tileContainer'>
                    <TileTwo/>
                  </div>
                </div>
              </Carousel>
          </Form>
      </div>
      <div style={{display:displaySuccess}}>
        {redirect ? <Navigate to="/login"/>:null}
        <Result
          status="success"
          title="Account Created!"
          subTitle="An email has been sent to the email address you registered with. Please follow the link in the email to verify your email address."
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
      <SiteFooter/>
    </>
  );
};

export default RegistrationPage;
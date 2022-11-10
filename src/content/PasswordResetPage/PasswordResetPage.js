import React, {useEffect, useState} from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { 
  Button,
  Form,
  Input,
  PageHeader,
  Result
} from "antd";
import GlobalHeader from "../../components/GlobalHeader";

export default function PasswordResetPage() {

  const [tokenParam, setTokenPeram] = useSearchParams();
  const [resetToken, setResetToken] = useState("");
  const [redirect, setRedirect] = useState(false);
  const [showRestForm, setShowResetForm] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [resetResult, setResetResult] = useState({
    "status":null,
    "title":"",
    "subtitle":"",
    "extra":[]
  });
  
  useEffect(() => setResetToken(tokenParam.get("resetToken")),[]);
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
      <div>
        <PageHeader
          className="resetHeader"
          title="Password Reset"
          />
      </div>
      <div id='resetForm'>
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
      </div></>:null
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
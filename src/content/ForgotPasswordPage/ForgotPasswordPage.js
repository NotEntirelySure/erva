import React, {useState} from "react";
import {
  Button,
  Form,
  Input,
  Modal,
  PageHeader 
} from "antd";
import GlobalHeader from "../../components/GlobalHeader";

export default function ForgotPasswordPage() {

  const onFinish = (values) => {
    fetch(`${process.env.REACT_APP_API_BASE_URL}/forgotpassword`, {
      method:'POST',
      mode:'cors',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify(values)
    })
    return Modal.success({
      title: 'Request Submitted',
      content: 'Your password reset request was successfully submitted. If the account exists, an email will be sent to the provided email address with a link to reset your password.',
    });
  };

  const onFinishFailed = (errorInfo) => {console.log('Failed:', errorInfo);};

  return (<>
    <GlobalHeader/>
    <div>
      <PageHeader
        className="forgotHeader"
        title="Forgot Password"
      />
    </div>
    <div id='forgotForm'>
    <div>
      <Form
        name="forgot password form"
        labelCol={{span:8}}
        wrapperCol={{span:16}}
        initialValues={{remember:false}}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
        >
        <Form.Item
          label="Email "
          name="email"
          rules={[{
            required: true,
            message: 'This is a required field'
          }]}
          extra="Enter the email address associated with your account."
        >
          <Input onPressEnter={onFinish}/>
        </Form.Item>
        <Form.Item
          wrapperCol={{
            offset: 8,
            span: 16
          }}
          >
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
    </div>
  </>)

}
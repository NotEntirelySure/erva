import { React } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from 'antd';

import WithAuth from './components/ProtectedRoute/WithAuth.js';
import LandingPage from './content/LandingPage';
import AboutUsPage from './content/AboutUsPage/AboutUsPage';
import RegistrationPage from './content/RegistrationPage';
import AccountVerificationPage from './content/AccountVerification';
import ForgotPasswordPage from './content/ForgotPasswordPage/ForgotPasswordPage';
import PasswordResetPage from './content/PasswordResetPage';
import TestPage from './content/TestPage';

import './App.scss';
import './index.scss';
const { Content } = Layout;

export default function App() {
  return (
    <>
      <Content>
        <Routes>
          <Route exact path="/" element={<LandingPage/>}/>
          <Route path="/aboutus" element={<AboutUsPage/>}/>
          <Route path="/register" element={<RegistrationPage/>}/>
          <Route path="/verifyaccount" element={<AccountVerificationPage/>}/>
          <Route path="/forgotpassword" element={<ForgotPasswordPage/>}/>
          <Route path="/passwordreset" element={<PasswordResetPage/>}/>

          <Route path="/userpage" element={<WithAuth page='user'/>}/>
          <Route path="/mappage" element={<WithAuth page='map'/>}/>
          <Route path="/test" element={<TestPage/>}/>
        </Routes>
      </Content>
    </>
  );
};
import { React } from 'react';
import { Route, Routes } from 'react-router-dom';

import LandingPage from './content/LandingPage';
import AdminLoginPage from './content/AdminLoginPage';
import UserLoginPage from './content/UserLoginPage';
import AdminPage from './content/AdminPage';
import UserPage from './content/UserPage';
import MapPage from './content/MapPage';
import RegistrationPage from './content/RegistrationPage';
import AccountVerificationPage from './content/AccountVerification';

import './App.scss';
import './index.scss';
import { Layout } from 'antd';
import AboutUsPage from './content/AboutUsPage/AboutUsPage';
const { Content } = Layout;

function loadScript () {
  const script = document.createElement("script");
  script.src = "https://d1p5cqqchvbqmy.cloudfront.net/websdk/v1.71.12/mappedin.js";
  script.async = true;
  document.body.appendChild(script);
}

export default function App() {
  loadScript()
  return (
    <>
      <Content>
        <Routes>
          <Route exact path="/" element={<LandingPage/>}/>
          <Route path="/login" element={<UserLoginPage/>}/>
          <Route path="/aboutus" element={<AboutUsPage/>}/>
          <Route path="/adminlogin" element={<AdminLoginPage/>}/>
          <Route path="/userpage" element={<UserPage/>}/>
          <Route path="/adminpage" element={<AdminPage/>}/>
          <Route path="/mappage" element={<MapPage/>}/>
          <Route path="/register" element={<RegistrationPage/>}/>
          <Route path="/verifyaccount" element={<AccountVerificationPage/>}/>
        </Routes>
      </Content>
    </>
  );
}
import { React } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from 'antd';

import WithAuth from './components/ProtectedRoute/WithAuth.js';
import AdminUsersPage from './content/AdminUsersPage';
import AdminOrganizationsPage from './content/AdminOrganizationsPage';
import AdminFacilitiesPage from './content/AdminFacilitiesPage';
import AdminBlueprintsPage from './content/AdminBlueprintsPage';
import LandingPage from './content/LandingPage';
import AboutUsPage from './content/AboutUsPage/AboutUsPage';
import AdminLoginPage from './content/AdminLoginPage';
import UserLoginPage from './content/UserLoginPage';
import UserPage from './content/UserPage';
import MapPage from './content/MapPage';
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
          <Route path="/login" element={<UserLoginPage/>}/>
          <Route path="/aboutus" element={<AboutUsPage/>}/>
          <Route path="/adminlogin" element={<AdminLoginPage/>}/>
          <Route path="/userpage" element={<UserPage/>}/>
          <Route path="/mappage" element={<MapPage/>}/>
          <Route path="/register" element={<RegistrationPage/>}/>
          <Route path="/verifyaccount" element={<AccountVerificationPage/>}/>
          <Route path="/forgotpassword" element={<ForgotPasswordPage/>}/>
          <Route path="/passwordreset" element={<PasswordResetPage/>}/>

          <Route path="/adminusers" element={<WithAuth page='users'/>}/>
          <Route path="/adminorganizations" element={<WithAuth page='organizations'/>}/>
          <Route path="/adminfacilities" element={<WithAuth page='facilities'/>}/>
          <Route path="/adminblueprints" element={<WithAuth page='blueprints'/>}/>

          <Route path="/test" element={<TestPage/>}/>
        </Routes>
      </Content>
    </>
  );
}
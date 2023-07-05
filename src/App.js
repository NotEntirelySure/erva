import { React } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from 'antd';

import AdminUsersPage from './content/AdminUsersPage';
import AdminOrganizationsPage from './content/AdminOrganizationsPage';
import AdminFacilitiesPage from './content/AdminFacilitiesPage';
import AdminBlueprintsPage from './content/AdminBlueprintsPage';
import LandingPage from './content/LandingPage';
import AboutUsPage from './content/AboutUsPage/AboutUsPage';
import AdminLoginPage from './content/AdminLoginPage';
import UserLoginPage from './content/UserLoginPage';
import AdminPage from './content/AdminPage';
import UserPage from './content/UserPage';
import MapPage from './content/MapPage';
import RegistrationPage from './content/RegistrationPage';
import AccountVerificationPage from './content/AccountVerification';
import ForgotPasswordPage from './content/ForgotPasswordPage/ForgotPasswordPage';
import PasswordResetPage from './content/PasswordResetPage';

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
          <Route path="/adminpage" element={<AdminPage/>}/>
          <Route path="/mappage" element={<MapPage/>}/>
          <Route path="/register" element={<RegistrationPage/>}/>
          <Route path="/verifyaccount" element={<AccountVerificationPage/>}/>
          <Route path="/forgotpassword" element={<ForgotPasswordPage/>}/>
          <Route path="/passwordreset" element={<PasswordResetPage/>}/>

          <Route path="/adminusers" element={<AdminUsersPage/>}/>
          <Route path="/adminorganizations" element={<AdminOrganizationsPage/>}/>
          <Route path="/adminfacilities" element={<AdminFacilitiesPage/>}/>
          <Route path="/adminblueprints" element={<AdminBlueprintsPage/>}/>

        </Routes>
      </Content>
    </>
  );
}
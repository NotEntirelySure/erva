import React, { useEffect, useState } from 'react';
import { Button } from '@carbon/react';
import { Login } from '@carbon/react/icons';
import { useNavigate } from 'react-router';
import forbiddenImage from '../../assets/images/403.png';
import AdminUsersPage from '../../content/AdminUsersPage';
import AdminOrganizationsPage from '../../content/AdminOrganizationsPage';
import AdminFacilitiesPage from '../../content/AdminFacilitiesPage';
import AdminBlueprintsPage from '../../content/AdminBlueprintsPage';
import AdminLoginPage from '../../content/AdminLoginPage';

export default function WithAuth(props) {
  
  const navigate = useNavigate();
  const [isAuth, setIsAuth] = useState();

  const forbidden = <>
    <div style={{
      backgroundColor:'#FEA918',
      height:'100vh'
    }}>
      <div style={{
        display:'flex',
        flexDirection:'column',
        gap:'3rem',
        justifyContent:'center',
        alignItems:'center'
      }}>
        <img src={forbiddenImage}></img>
        <Button
          kind='secondary'
          renderIcon={Login}
          children='Login'
          onClick={() => navigate('/adminlogin')}
        />
      </div>
    </div>
  </>;

  useEffect(() => {verifyJwt();},[]);
  useEffect(() => {RenderPage()},[isAuth])

  async function verifyJwt() {
    const token = sessionStorage.getItem("ervaJwt");
    if (!token) {
      setIsAuth(false);
      return;
    }
    if (token) {
      const query = `
        query {
          verifyAdmin {
            isAuth
          }
        }
      `;
      const verifyRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api`, {
        mode:'cors',
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          Accept:'application/json',
          Authorization:`Bearer ${token}`
        },
        body:JSON.stringify({ query })
      });
      const verifyResponse = await verifyRequest.json();
      if (!verifyResponse.error) setIsAuth(verifyResponse.data.verifyAdmin.isAuth);
      else {setIsAuth(false)};
    };
  };

  function RenderPage() {
    switch (isAuth) {
      case true:
        let page;
        switch (props.page) {
          case "users":
            page = <AdminUsersPage/>
            break;
          case "organizations":
            page = <AdminOrganizationsPage/>
            break;
          case "facilities":
            page = <AdminFacilitiesPage/>
            break;
          case "blueprints":
            page = <AdminBlueprintsPage/>
            break;
          default: page = <AdminLoginPage/>
        };
        return page;
      case false: return forbidden
      default: return <><div></div></>
    };
  }

  return(<RenderPage/>);
};
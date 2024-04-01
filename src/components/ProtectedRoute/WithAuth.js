import React, { useEffect, useState } from 'react';
import { Button } from '@carbon/react';
import { Login } from '@carbon/react/icons';
import { useNavigate } from 'react-router';
import forbiddenImage from '../../assets/images/403.png';
import UserPage from '../../content/UserPage/UserPage.js';
import MapPage from '../../content/MapPage/MapPage.js';

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
          onClick={() => navigate('/')}
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
          verifyAccess {
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
      if (verifyRequest.status === 403) {
        setIsAuth(false);
        return;
      }
      const verifyResponse = await verifyRequest.json();
      if (!verifyResponse.error) setIsAuth(verifyResponse.data.verifyAccess.isAuth);
      else {setIsAuth(false)};
    };
  };

  function RenderPage() {
    switch (isAuth) {
      case true:
        let page;
        switch (props.page) {
          case "user":
            page = <UserPage/>
            break;
          case "map":
            page = <MapPage/>
            break;
          default: page = <><div></div></>
        };
        return page;
      case false: return forbidden
      default: return <><div></div></>
    };
  }

  return(<RenderPage/>);
};
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Avatar,
  Button,
  Input,
  Drawer
} from 'antd';
import { UserOutlined } from '@ant-design/icons';
import entPortal from '../../assets/images/ERVA_Ent_Portal.jpg';
import govPortal from '../../assets/images/ERVA_Gov_Portal.png';
import genPortal from '../../assets/images/ERVA_Portal.jpg';
import eyeLogo from '../../assets/images/eye_logo.jpg';

const { Search } = Input;

const GlobalHeader = (props) => {

  const [drawerOpen, setDrawerOpen] = useState(false);

  const PortalLogo = () => {
    if (props.isAuth) {
      switch (props.userInfo.type) {
        case "enterprise":
          return <>
            <Link to='/'>
              <img className='logoImage' src={entPortal}></img>
            </Link>
          </>
        case "government":
          return <>
            <Link to='/'>
              <img className='logoImage' src={govPortal}></img>
            </Link>
          </>
        case "generic":
          return <>
            <Link to='/'>
              <img className='logoImage' src={genPortal}></img>
            </Link>
          </>
      }
    }
    if (!props.isAuth) {
      return <>
        <Link to='/'>
          <div style={{maxWidth:'75%'}}>
          <img id="genericLogo" src={eyeLogo}></img>
          </div>
        </Link>
      </>
    }
  }

  const UserPanel = () => {
    if (props.isAuth) {
      return <>
        <div className='userAvatar'>
          <Avatar 
            onClick={() => setDrawerOpen(true)}
            icon={<UserOutlined />}
            size={{
              xs: 24,
              sm: 32,
              md: 40,
              lg: 54,
              xl: 64,
              xxl:64
            }}
            gap={1}
          >
            {props.userInfo.email}
          </Avatar>
        </div>
        <Drawer title={props.userInfo.email} placement="right" onClose={() => setDrawerOpen(false)} visible={drawerOpen}>
          <p>Name: {`${props.userInfo.fname} ${props.userInfo.lname}`}</p>
          <p>Account Type: {props.userInfo.type}</p>
          <Link to='/' onClick={() => sessionStorage.removeItem("jwt")}><Button type="primary">logout</Button></Link>
          <Button>settings</Button>
        </Drawer>
      </>
    }
  }
  return <>
    <div className="globalHeader">
      <div className='logoContainer'>
        <PortalLogo/>
      </div>
        <UserPanel/>
    </div>
  </>
};
export default GlobalHeader;
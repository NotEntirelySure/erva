import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Avatar,
  Button,
  Input,
  Drawer
} from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Search } = Input;

const GlobalHeader = (props) => {

  const [drawerOpen, setDrawerOpen] = useState(false);

  return <>
    <div className="globalHeader">
      <div className='logoContainer'>
        {props.isAuth ? null:<Link to='/'><img style={{width:"72%", height:"auto"}} src={`${process.env.PUBLIC_URL}/eye_logo.jpg`}></img></Link>}
        {
          props.isAuth && props.userInfo.type === "enterprise" ? 
            <Link to='/'>
              <img className='logoImage' src={`${process.env.PUBLIC_URL}/ERVA_Ent_Portal.jpg`}></img>
            </Link>:null
        }
        {
          props.isAuth && props.userInfo.type === "government" ? 
            <Link to='/'>
              <img className='logoImage' src={`${process.env.PUBLIC_URL}/ERVA_Gov_Portal.png`}></img>
            </Link>:null
        }
      </div>
      {
        props.isAuth ? <>
        <div className='searchBar'>
          <Search placeholder="Search by district" enterButton="Search" allowClear size="large"/>
        </div>
        <div className='userAvatar'>
          <Avatar onClick={() => setDrawerOpen(true)} icon={<UserOutlined />} size="large" gap={1}>
            {props.userInfo.email}
          </Avatar>
        </div>
        <Drawer title={props.userInfo.email} placement="right" onClose={() => setDrawerOpen(false)} visible={drawerOpen}>
          <p>Name: {`${props.userInfo.fname} ${props.userInfo.lname}`}</p>
          <p>Account Type: {props.userInfo.type}</p>
          <Link to='/' onClick={() => sessionStorage.removeItem("jwt")}><Button type="primary">logout</Button></Link>
          <Button>settings</Button>
        </Drawer></>:null
      }
    </div>
  </>
};
export default GlobalHeader;
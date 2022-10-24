import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';

import logo from '../../assets/images/logo.jpg'
const LandingPage = () => {

  return (
    <>
      <div id="LandingPageContent">
      <div id="imageContainer"><img id='landingPageImage' src={logo}></img></div>
        <div className='buttondiv'>
          <Link to='/login'>
            <Button className='landingPageButton' type="default">Login</Button>
          </Link>
        </div>
        <div className='buttondiv'>
          <Link to='/aboutus'>
            <Button className='landingPageButton' type='link'>About Us</Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'antd';

const LandingPage = () => {

  return (
    <>
      <div id="LandingPageContent">
        <div><img id='landingPageImage' src={`${process.env.PUBLIC_URL}/logo.jpg`}></img></div>
        
      <div id='buttondiv'>
          <Link to='/login'>
            <Button className='landingPageButton' type="default">Login</Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default LandingPage;
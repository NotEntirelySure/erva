import React, { useState, useEffect } from 'react';
import { Carousel, Col, Divider, Row, Typography} from 'antd';
import GlobalHeader from '../../components/GlobalHeader';
import emt from '../../assets/images/aboutus/emt.jpg';
import swat from '../../assets/images/aboutus/swat.jpg';
import cliff from '../../assets/images/aboutus/cliff_2.jpg';
import zeke from '../../assets/images/aboutus/zeke.jpg';
import jeff from '../../assets/images/aboutus/jeff.jpg';

const { Paragraph, Text } = Typography;

const AboutUsPage = () => {

  const [aboutPosition, setAboutPosition] = useState('');
  const [ervaPosition, setErvaPosition] = useState('');
  const [quotePosition, setQuotePosition] = useState('')
  useEffect(() => {
    setAboutPosition('translate(18rem,0rem)');
    setErvaPosition('translate(65rem,0rem)');
    setQuotePosition('translate(0rem, 2rem)');
  })
  return (
    <>
      <GlobalHeader/>
      <div className='aboutHeader'>
        <div style={{
          position:'absolute',
          margin:'2rem 0rem 0rem -15rem',
          transition:'0.5s',
          transform:aboutPosition}}
        >
          <p className='aboutHeaderText'>About</p>
        </div>
        <div 
          style={{
            position:'absolute',
            margin:'10rem 0rem 0rem -55rem',
            transition:'0.5s',
            transform:ervaPosition
          }}
        >
        <p className='aboutHeaderText'>E.R.V.A. Defense Systems</p>
        </div>
        <div 
          style={{
            position:'absolute',
            margin:'18rem 0rem 0rem 20rem',
            transition:'1s',
            animation: 'fadeIn 1s',
            transform:quotePosition
          }}
        >
          <p style={{color:'#E6E6E6', fontSize:'1rem'}}>"Because a safer environment is a prosperous one."</p></div>
      </div>
      <div className='aboutBody'>
      <div style={{padding:'2rem'}}>
          <div>
            <Divider orientation="center">Mission Statment</Divider>
          </div>
              <div >
                <Paragraph>
                    <Text>
                      Technology is an ever-evolving industry, and our nation is in a perpetual state of crisis. In
                      response to this climate, our goal is to utilize the technology at our fingertips and outfit it with the
                      necessary resources that would empower individuals to make the best decisions possible that
                      find themselves in a facility under crisis. We intend to offer services that may include individual,
                      family and community training programs in response to the different types of emergencies or
                      crises in the future. E.R.V.A. seeks to create, increase, and maintain safe working, learning and living
                      environments for our clients that will help their companies prosper and grow in response to the rising
                      crisis in our nation.
                    </Text>
                </Paragraph>
              </div>
        </div>
        <div style={{padding:'2rem'}}>
          <div>
            <Divider orientation="left">Product</Divider>
          </div>
              <div style={{width:'50vw'}}>
                <Paragraph>
                    <Text>
                        E.R.V.A (Emergency Response Visual Aid) is a unique technology-based information system
                        intended to assist and equip enterprises with the tools for their staff to govern and respond to
                        specific types of emergency or crisis situations within a facility. It can be tailored to businesses
                        of any scale. Services include, safety equipment, wayfinding, navigation and event planning
                        features, providing an opportunity to aid in the preservation of innocent life under crisis driven
                        circumstances until first responders arrive.
                    </Text>
                </Paragraph>
              </div>
        </div>
      <div className="aboutUsHeaderImage"></div>
      <div style={{paddingTop:"5rem"}}>
        <div className='imageContainer'>
          <div><img className="emtImage" src={emt} alt=''></img></div>
          <div>
            <Divider orientation="left">EMT Response</Divider>
            <p style={{fontSize:'1.5rem'}}>
              ERVA assists Emergency Medical Teams in rapid response and location identification of persons
              experiencing medical emergencies; saving lives and improving the emergency response capabilities
              of local municipalities.
            </p>
          </div>
        </div>
        <div className='imageContainer'>
          <div>
            <Divider orientation="left">Police Response</Divider>
              <p style={{fontSize:'1.5rem'}}>
                ERVA services augment law enforment activities by providing real-time, relevant data to assist responding officers
                with critical information for decesion-making processes. ERVA enables law enforcement to better protect the community
                and nutralize threats.
              </p>
          </div>
          <div><img className="swatImage" src={swat} alt=''></img></div>
        </div>
      </div>
          <div className='theTeam'>
              <Divider orientation="left">Meet the Founders</Divider>
            <Row>
              <Col span={6}></Col>
              <Col span={6}>
                <img className='headshots' src={cliff} alt=''></img>
                <Paragraph>
                  <Text>
                    <blockquote>
                      Clifford Rosenberg
                      <br/>
                      Senior Development Manager
                    </blockquote>
                  </Text>
                </Paragraph>
              </Col>
              <Col span={6}>
                  <img className='headshots' src={zeke} alt=''></img>
                  <Paragraph>
                      <Text>
                          <blockquote>
                              Esiquo Uribe
                              <br/>
                              Chief Operations Officer
                          </blockquote>
                      </Text>
                  </Paragraph>
              </Col>
              <Col span={6}>
                  <img className='headshots' src={jeff} alt=''></img>
                  <Paragraph>
                      <Text>
                          <blockquote>
                              Jeffery Rosenberg
                              <br/>
                              Chief Solutions Archetect
                          </blockquote>
                      </Text>
                  </Paragraph>
              </Col>
          </Row>
          </div>
      </div>
      <div style={{padding:'5%'}}>
          <Divider orientation="left">
              Contact Us
          </Divider>
      </div>
      <div style={{padding:'5%'}}>
          <Row>
              <Col span={12}>
                  <Text>
                      <blockquote>
                          Tel: 305.348.0019
                          <br/>
                          Email: <a href="mailto:ervasystems@gmail.com">ervasystems@gmail.com</a>
                      </blockquote>
                  </Text>
              </Col>
              <Col span={12}>
                  <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d114614.47188652703!2d-80.21560732058772!3d26.141249675576127!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x88d9012720facaf5%3A0x7602be7540bf8ebe!2sFort%20Lauderdale%2C%20FL!5e0!3m2!1sen!2sus!4v1658855072695!5m2!1sen!2sus"
                      width="600"
                      height="450"
                      style={{border:"0"}}
                      allowfullscreen=""
                      loading="lazy"
                      referrerpolicy="no-referrer-when-downgrade">
                  </iframe>
              </Col>
          </Row>
      </div>
    </>
  );
};

export default AboutUsPage;
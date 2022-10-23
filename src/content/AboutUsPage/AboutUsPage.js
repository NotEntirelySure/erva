import React from 'react';
import { Carousel, Col, Divider, Row, Typography} from 'antd';
import GlobalHeader from '../../components/GlobalHeader';
import emt from '../../assets/images/aboutus/emt.jpg';
import swat from '../../assets/images/aboutus/swat.jpg';
import cliff from '../../assets/images/aboutus/cliff_2.jpg';
import zeke from '../../assets/images/aboutus/zeke.jpg';
import jeff from '../../assets/images/aboutus/jeff.jpg';

const { Paragraph, Text } = Typography;

const AboutUsPage = () => {

  return (
    <>
        <GlobalHeader/>
        <div className="aboutUsHeaderImage">
            <div style={{height:'15vh'}}/>
                <div style={{padding:'5%', backgroundColor:'white'}}>
                    <Divider orientation="left">
                        About Us
                    </Divider>
                    <Paragraph>
                        <Text>
                            Emergency Response Visual Aid (ERVA) is a modern information processing, aggregation, presentation software intended to aide first responders and emergency services to more effectively respond to emergency situations to save lives.
                        </Text>
                    </Paragraph>
                </div>
            </div>
        <div>
        <div style={{paddingTop:"5%", paddingBottom:"5%"}}>
            <Carousel autoplay>
            <div>

            <Row gutter={[16]}>
                <Col span={12}>
                    <img className="emtImage" src={emt} alt=''></img>
                </Col>
                <Col span={12}>
                <Divider orientation="left">
                    EMT Response
                </Divider>
                <p>ERVA assists Emergency Medical Teams in rapid response and location identification of persons experiencing medical emergencies; saving lives and improving the emergency response capabilities of local municipalities.</p>
                </Col>
            </Row>
            </div>
            <div>

            <Row>
                <Col span={12}>
                <Divider orientation="left">
                    Police Response
                </Divider>
                <p>ERVA services augment law enforment activities by providing real-time, relevant data to assist responding officers with critical information for decesion-making processes. ERVA enables law enforcement to better protect the community and nutralize threats.</p>
                </Col>
                <Col span={12}>
                    <img className="swatImage" src={swat} alt=''></img>
                </Col>
            </Row>
            </div>
            </Carousel>
            </div>
            <div className='theTeam'>
                <Divider orientation="left">
                    Meet the Founders
                </Divider>
            <Row>
                <Col span={6}>
                </Col>
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
import React, {useState, useEffect, Component } from 'react'
import {Navigate, useNavigate } from 'react-router-dom';
import GlobalHeader from '../../components/GlobalHeader'
import {
  Alert,
  Button,
  Card,
  PageHeader,
  Result,
  Spin,
  Tabs
} from 'antd';
import { ExclamationCircleOutlined, EyeFilled } from '@ant-design/icons';
import SiteFooter from '../../components/SiteFooter/SiteFooter';
const { TabPane } = Tabs;

export default function UserPage () {
  
  const navigate = useNavigate();
  const [loginRedirect, setLoginRedirect] = useState(false);
  const [redirect, setRedirect] = useState(false);

  const [jwtToken, setJtwToken] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [locationList, setLocationList] = useState([]);
  const [userInfo, setUserInfo] = useState([]);
  const [officeInfo, setOfficeInfo] = useState([]);
  const [facilityInfo, setFacilityInfo] = useState([]);
  const [mapsInfo, setMapsInfo] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState({});
  const [tabsLoading, setTabsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingDescription, setLoadingDescription] = useState('');
  const [contentLoading, setContentLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState({});
  const [facilityCards, setFacilityCards] = useState('block');
  const [mapCards, setMapCards] = useState('none');
  const [backButtonOffice, setBackButtonOffice] = useState('');
  const [showWarning, setShowWarning] = useState(false);


  useEffect(() => {if (sessionStorage.getItem("jwt")) setJtwToken(sessionStorage.getItem("jwt"));},[])

  useEffect(() => {verifyJwt()},[jwtToken])

  const verifyJwt = async() => {
    setTabsLoading(true);
    setLoadingMessage("Getting Offices");
    setLoadingDescription("Getting offices assigned to you.")
    const verifyRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/verifyjwt`, {
      method:'POST',
      mode:'cors',
      headers:{'Content-Type':'application/json'},
      body:`{"token":"${jwtToken}"}`
    });
    const verifyResponse = await verifyRequest.json();
    if (verifyResponse.error) {console.log("error",verifyResponse.error)}
    if (verifyResponse.result) {
      setUserInfo(
        {
          "id":verifyResponse.result.id,
          "fname":verifyResponse.result.fname,
          "lname":verifyResponse.result.lname,
          "email":verifyResponse.result.email,
          "type":verifyResponse.result.type
        }
      )
      setIsAuth(true);
      const officeRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/getoffices`, {
        method:'POST',
        mode:'cors',
        headers:{'Content-Type':'application/json'},
        body:`{"token":"${jwtToken}"}`
      });
      const officeResponse = await officeRequest.json();
      setOfficeInfo(officeResponse);
      setTabsLoading(false);
      if (officeResponse.length > 0) {getFacilities(officeResponse[0].id)}
      if (officeResponse.length === 0) {
        setShowWarning(true)
        setAlertMessage({
          type:'warning',
          description:'There are no offices assigned to your account. Please contact your account manager to add offices.',
          message:"No facilities to show"
        })
      }
        
    }
  }

  const getFacilities = async(officeId) => {
    setLoadingMessage("Getting Facilities");
    setLoadingDescription("Getting facilities associated to the selected office.");
    setContentLoading(true);
    const facilitiesRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/getfacilities`, {
      method:'POST',
      mode:'cors',
      headers:{'Content-Type':'application/json'},
      body:`{"token":"${jwtToken}","office":"${officeId}"}`
    });
    const facilitiesResponse = await facilitiesRequest.json();
    if (facilitiesResponse.length <= 0) {}
    if (facilitiesResponse.length > 0) {}
    setFacilityInfo(facilitiesResponse);
    setContentLoading(false);
    setFacilityCards('block');
    setMapCards('none');
    setBackButtonOffice(officeId);

  }

  const RenderFacilities = () => {
    return facilityInfo.map((facility) => {
      return (
        <>
          <div>
            <Card key={facility.id} title={facility.name} className='locationCard'>
              <img 
                className='cardImage'
                onClick={() => {
                  setSelectedFacility({
                    "name":facility.name,
                    "address":facility.address,
                    "city":facility.city,
                    "state":facility.state,
                    "zip":facility.zip
                  })
                  getFacilityMaps(facility.id)
                }}
                src={`data:image/png;base64,${facility.image}`}
                alt=""
                />
            </Card>
          </div>
        </>
      )
    })
  }

  const getFacilityMaps = async(facilityId) => {
    setLoadingMessage("Getting maps");
    setLoadingDescription("Getting maps associated to the selected facility.");
    setContentLoading(true);
    const mapsRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/getfacilitymaps`, {
      method:'POST',
      mode:'cors',
      headers:{'Content-Type':'application/json'},
      body:`{"token":"${jwtToken}","facility":"${facilityId}"}`
    });
    const mapsResponse = await mapsRequest.json();
    if (mapsResponse.length <= 0) {}
    if (mapsResponse.length > 0) {}
    setMapsInfo(mapsResponse);
    setContentLoading(false);
    setFacilityCards('none');
    setMapCards('block');
  }

  const RenderMaps = () => {
    return <>
      <PageHeader
        style={{display:backButtonOffice}}
        onBack={() => getFacilities(backButtonOffice)}
        title="Back"
      />
      <div style={{display:'flex'}}>
        <div>
        <p style={{color:'#1A95CC'}} className="facilityAddress">{selectedFacility.name}</p>
        <p className="facilityAddress">{selectedFacility.address}</p>
        <p className="facilityAddress">{selectedFacility.city}, {selectedFacility.state} {selectedFacility.zip}</p>
        </div>
        <div style={{marginLeft:'5%'}}>
          <Button 
            type='primary'
            onClick={() => {
              navigate(
                '/mappage',
                {state:{map:"mappedin-demo-mall"}}
              )
            }}
            icon={<EyeFilled style={{width:'1em', height:'1em'}}/>}
          > 
           Wayfind
          </Button>
        </div>
        <br/>
      </div>
      <div>
        {
          mapsInfo.map((map) => {
            return (
              <div>
                <Card key={map.id} title={map.name} className='locationCard'>
                  <img 
                    onClick={() => {}}
                    className='cardImage'
                    src={`data:image/png;base64,${map.image}`}
                    alt=""
                  />
                </Card>
              </div>
            )
          })
        }
      </div>
    </>
  }

  
  return (
    <>
      <GlobalHeader isAuth={isAuth} userInfo={userInfo}/>
          {
          showWarning ? 
            <div style={{marginTop:'2rem'}}>
              <Alert 
                message={alertMessage.message}
                description={alertMessage.description}
                type={alertMessage.type}
                icon={<ExclamationCircleOutlined />}
                showIcon
              />
            </div>:null
          }
      <div className='content'>
        <div style={{marginTop:'2rem'}}>
          {
            tabsLoading ? <>
              <Spin tip="Loading...">
                <Alert
                  message={loadingMessage}
                  description={loadingDescription}
                  type="info"
                />
              </Spin>
            </>:<Tabs defaultActiveKey="0" onChange={(tabId) =>{console.log(tabId);getFacilities(tabId)}}>
              {
                officeInfo.map((office) => {
                  return <>
                    <TabPane tab={office.name} key={`${office.id}`}>
                    <br/>
                    </TabPane>
                  </>
                })
              }
            </Tabs>
          }
        </div>
        <div className='cardContainer'>
          {
            contentLoading ? 
              <>
                <div style={{width:'100%'}}>

                <Spin tip="Loading...">
                  <Alert
                    message={loadingMessage}
                    description={loadingDescription}
                    type="info"
                    />
                </Spin>
                    </div>
              </>
              :
              <>
                <div style={{display:facilityCards}}><RenderFacilities/></div>
                <div style={{display:mapCards}}><RenderMaps/></div>
              </>
          }
        </div>
        <div>
          {
            isAuth ? null:<>
              {loginRedirect ? <Navigate to="/login"/>:null}
              <Result
                status="403"
                title="403"
                subTitle="Sorry, you are not authorized to access this page."
                extra={<Button onClick={() => setLoginRedirect(true)} type="primary">Login</Button>}
              />
            </>
          }
        </div>
      </div>
      <SiteFooter/>
    </>
  );
}
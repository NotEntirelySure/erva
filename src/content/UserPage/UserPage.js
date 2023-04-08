import React, {useState, useEffect, useRef, useId } from 'react'
import {Navigate, useNavigate, useResolvedPath } from 'react-router-dom';
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
  const jwt = useRef(null);
  const [isAuth, setIsAuth] = useState(null);
  const [authErrorStatus, setAuthErrorStatus] = useState({status:"info",title:"",subTitle:""})
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


  useEffect(() => {
    if (!sessionStorage.getItem("jwt")) {
      setIsAuth(false);
      setAuthErrorStatus({
        status:403,
        title:"Error 401",
        subTitle:"Sorry, you are not authorized to access this page. Please login to access this page."
      })
    }
    if (sessionStorage.getItem("jwt")) jwt.current = sessionStorage.getItem("jwt");
  },[])

  useEffect(() => {verifyJwt()},[jwt.current])

  const verifyJwt = async() => {
    setTabsLoading(true);
    setLoadingMessage("Getting Offices");
    setLoadingDescription("Getting offices assigned to you.")
    const verifyRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/verifyjwt`, {
      method:'POST',
      mode:'cors',
      headers:{'Content-Type':'application/json'},
      body:`{"token":"${jwt.current}"}`
    });
    const verifyResponse = await verifyRequest.json();
    if (verifyResponse.error) {
      switch (verifyResponse.errorCode){
        case 498:
          setAuthErrorStatus({
            status:403,
            title:"Error 498",
            subTitle:"Your session has expired. Please login again to access this page."
          })
          break;
        case 401:
          setAuthErrorStatus({
            status:403,
            title:"Error 498",
            subTitle:"Sorry, you are not authorized to access this page. Please login to access this page."
          })
          break;
        default: setAuthErrorStatus({
          status:403,
          title:"Error 498",
          subTitle:"Sorry, you are not authorized to access this page. Please login to access this page."
        }) 
      }
      setIsAuth(false);
    }
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
        body:`{"token":"${jwt.current}"}`
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

  const getApiKey = async() => {

    const apiKeyRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/getapikey`, {
      method:'POST',
      mode:'cors',
      headers:{'Content-Type':'application/json'},
      body:`{"token":"${jwt.current}"}`
    });
    const apiKeyResponse = await apiKeyRequest.json()
    if (apiKeyResponse.code === 200) {
      navigate(
        '/mappage',
        {
          state:{
            "map":selectedFacility.code,
            "apiKey":apiKeyResponse.apiKey
          }
        }
      )
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
      body:`{"token":"${jwt.current}","office":"${officeId}"}`
    });
    const facilitiesResponse = await facilitiesRequest.json();
    if (facilitiesResponse.length <= 0) {}
    if (facilitiesResponse.length > 0) setFacilityInfo(facilitiesResponse);
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
                    "zip":facility.zip,
                    "code":facility.code
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
      body:`{"token":"${jwt.current}","facility":"${facilityId}"}`
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
        <p>{selectedFacility.code}</p>
        </div>
        <div style={{marginLeft:'5%'}}>
          <Button 
            type='primary'
            onClick={() => getApiKey()}
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
        
      <div className='content'>
        {
          isAuth === true ? <>
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
                </>:<Tabs defaultActiveKey="0" onChange={tabId => getFacilities(tabId)}>
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
          </>:<><div></div></>
        }
        <div>
          {
            isAuth === false ? <>
              <Result
                status={authErrorStatus.status}
                title={authErrorStatus.title}
                subTitle={authErrorStatus.subTitle}
                extra={<Button onClick={() => navigate('/login')} type="primary">Login</Button>}
              />
            </>:<><div></div></>
          }
        </div>
      </div>
      <SiteFooter/>
    </>
  );
}
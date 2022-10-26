import React, { Component } from 'react'
import { Navigate } from 'react-router-dom';
import GlobalHeader from '../../components/GlobalHeader'
import {
  Alert,
  Button,
  Card,
  Image,
  PageHeader,
  Result, 
  Spin,
  Tabs
} from 'antd';
import { ArrowLeftOutlined, EyeFilled } from '@ant-design/icons';
const { TabPane } = Tabs;

class UserPage extends Component {
  
  constructor(props) {
    super(props)
    this.state = {
      loginRedirect:false,
      jwtToken:"",
      locationList:[],
      userInfo:[],
      officeInfo:[],
      facilityInfo:[],
      mapsInfo:[],
      selectedFacility:{},
      isAuth:null,
      tabsLoading:false,
      loadingMessage:'',
      loadingDescription:'',
      contentLoading:false,
      alertMessage:'',
      alertType:'',
      showFacilityCards:true,
      showMapCards:false,
      backButtonOffice:'',
      redirect:false
    }
  }

  componentDidMount = async() => {
    
    if (sessionStorage.getItem("jwt")) this.setState({jwtToken: sessionStorage.getItem("jwt")}, () => {this.VerifyJwt();})
    if (!sessionStorage.getItem("jwt")) this.setState({isAuth:false})

  }
  
  ReturnNotAuth = () => {
    if (!this.state.isAuth) {
      return <>
        <div>
          {this.state.loginRedirect ? <Navigate to="/login"/>:null}
          <Result
            status="403"
            title="403"
            subTitle="Sorry, you are not authorized to access this page."
            extra={<Button onClick={() => this.setState({loginRedirect:true})} type="primary">Login</Button>}
          />
        </div>
      </>
    }
    else return <><div></div></>
  }

  VerifyJwt = async() => {
    this.setState({
      tabsLoading:true,
      loadingMessage:"Getting Offices",
      loadingDescription:"Getting offices assigned to you."
    })
    const verifyRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/verifyjwt`, {
      method:'POST',
      mode:'cors',
      headers:{'Content-Type':'application/json'},
      body:`{"token":"${this.state.jwtToken}"}`
    });
    const verifyResponse = await verifyRequest.json();
    if (verifyResponse.error) {console.log("error",verifyResponse.error)}
    if (verifyResponse.result) {
      this.setState({
        isAuth:true,
        userInfo:{
          "id":verifyResponse.result.id,
          "fname":verifyResponse.result.fname,
          "lname":verifyResponse.result.lname,
          "email":verifyResponse.result.email,
          "type":verifyResponse.result.type
        }
      })
      const officeRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/getoffices`, {
        method:'POST',
        mode:'cors',
        headers:{'Content-Type':'application/json'},
        body:`{"token":"${this.state.jwtToken}"}`
      });
      const officeResponse = await officeRequest.json();
      console.log(officeResponse.length);
      this.setState({
        officeInfo:officeResponse,
        tabsLoading:false}, () => {
          if (officeResponse.length > 0) {this.GetFacilities(officeResponse[0].id)}
          if (officeResponse.length === 0) {this.setState({
            alertType:'warning',
            alertMessage:'There are no offices assigned to your account. Please contact your account manager to add offices.'
          })}
        }
      );
    
    }
  }

  GetFacilities = async(officeId) => {
    this.setState({
      contentLoading:true,
      loadingMessage:"Getting Facilities",
      loadingDescription:"Getting facilities associated to the selected office."
    })
    const facilitiesRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/getfacilities`, {
      method:'POST',
      mode:'cors',
      headers:{'Content-Type':'application/json'},
      body:`{"token":"${this.state.jwtToken}","office":"${officeId}"}`
    });
    const facilitiesResponse = await facilitiesRequest.json();
    if (facilitiesResponse.length <= 0) {}
    if (facilitiesResponse.length > 0) {}
    this.setState({
      facilityInfo:facilitiesResponse,
      contentLoading:false,
      showMapCards:false,
      showFacilityCards:true,
      backButtonOffice:officeId
    })
  }

  RenderFacilities = () => {
    return this.state.facilityInfo.map((facility) => {
      return (<>
        <div>
          <Card key={facility.id} title={facility.name} className='locationCard'>
            <img 
              className='cardImage'
              onClick={() => {
                this.GetFacilityMaps(facility.id)
                this.setState({selectedFacility:{
                  "name":facility.name,
                  "address":facility.address,
                  "city":facility.city,
                  "state":facility.state,
                  "zip":facility.zip
                }})
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

  GetFacilityMaps = async(facilityId) => {
    this.setState({
      contentLoading:true,
      loadingMessage:"Getting maps",
      loadingDescription:"Getting maps associated to the selected facility."
    })
    const mapsRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/getfacilitymaps`, {
      method:'POST',
      mode:'cors',
      headers:{'Content-Type':'application/json'},
      body:`{"token":"${this.state.jwtToken}","facility":"${facilityId}"}`
    });
    const mapsResponse = await mapsRequest.json();
    if (mapsResponse.length <= 0) {}
    if (mapsResponse.length > 0) {}
    this.setState({
      mapsInfo:mapsResponse,
      contentLoading:false,
      showMapCards:true,
      showFacilityCards:false,
      backButton:'block'
    })
  }

  RenderMaps = () => {
    return <>
      {this.state.redirect ? <Navigate to="/mappage"/>:null}
      <PageHeader
        style={{display:this.state.backButtonOffice}}
        onBack={() => this.GetFacilities(this.state.backButtonOffice)}
        title="Back"
      />
      <div className="facilityAddressHeader">
        <div>
          <p style={{color:'#1A95CC'}} className="facilityAddress">{this.state.selectedFacility.name}</p>
          <p className="facilityAddress">{this.state.selectedFacility.address}</p>
          <p className="facilityAddress">{this.state.selectedFacility.city}, {this.state.selectedFacility.state} {this.state.selectedFacility.zip}</p>
        </div>
        <div>
          <Button 
            type='primary'
            onClick={() => {this.setState({redirect:true})}}
            icon={<EyeFilled style={{width:'1em', height:'1em'}}/>}
          > 
           Wayfind
          </Button>
        </div>
      </div>
      <div className='cardContainer'>
        {
          this.state.mapsInfo.map((map) => {
            return (
              <Card key={map.id} title={map.name} className='locationCard'>
                <Image 
                  onClick={() => {}}
                  className='cardImage'
                  src={`data:image/png;base64,${map.image}`}
                  alt=""
                />
              </Card>
            )
          })
        }
      </div>
    </>
  }

  render() {
    return (
      <>
        <GlobalHeader isAuth={this.state.isAuth} userInfo={this.state.userInfo}/>
        <Alert message={this.state.alertMessage} type={this.state.alertType}/>
        {
          this.state.isAuth ? 
          <div className='content'>
            <div className='officeTabs'>
              {
                this.state.tabsLoading ? <>
                  <Spin tip="Loading...">
                    <Alert
                      message={this.state.loadingMessage}
                      description={this.state.loadingDescription}
                      type="info"
                    />
                  </Spin>
                </>:<Tabs defaultActiveKey="0" onChange={(tabId) =>{this.GetFacilities(tabId)}}>
                  {
                    this.state.officeInfo.map((office) => {
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
            <div>
              {
                this.state.contentLoading ? 
                  <>
                    <Spin tip="Loading...">
                      <Alert
                        message={this.state.loadingMessage}
                        description={this.state.loadingDescription}
                        type="info"
                      />
                    </Spin>
                  </>:<>
                    <div>
                      {this.state.showFacilityCards ? <div className='cardContainer'><this.RenderFacilities/></div>:null}
                      {this.state.showMapCards ? <div><this.RenderMaps/></div>:null}
                    </div>
                  </>
              }
              
            </div>
          </div>:<this.ReturnNotAuth/>
        }
        
      </>
    );
  };
}

export default UserPage; 
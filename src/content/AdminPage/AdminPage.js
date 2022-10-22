import React, { Component } from 'react'
import { Navigate } from 'react-router-dom';
import GlobalHeader from '../../components/GlobalHeader'
import {
  Button,
  Card,
  Divider, 
  Col,
  Menu, 
  Result, 
  Row,
  Table,
  Tabs
} from 'antd';
import {
  CompassOutlined,
  UserSwitchOutlined,
  TeamOutlined,
  HomeOutlined,
  SolutionOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { ArrowLeftOutlined, EyeFilled } from '@ant-design/icons';
const { TabPane } = Tabs;
const userColumns = [
  {title:'User ID',dataIndex:'userId',key:'userId'},
  {title:'First Name',dataIndex:'firstName',key:'firstName'},
  {title:'Last Name',dataIndex:'lastName',key:'lastName'},
  {title:'Email',dataIndex:'email',key:'email'},
  {title:'Type',dataIndex:'accountType',key:'accountType'},
  {title:'Role',dataIndex:'role',key:'role'},
  {title:'Created At',dataIndex:'createdAt',key:'createdAt'},
  {title:'Status',dataIndex:'status',key:'status'}
]

class AdminPage extends Component {
  
  constructor(props) {
    super(props)
    this.state = {
      loginRedirect:false,
      jwtToken:"",
      userInfo:[],
      usersList:[],
      officeInfo:[],
      facilityInfo:[],
      mapsInfo:[],
      selectedFacility:{},
      isAuth:false,
      loadingMessage:'',
      loadingDescription:'',
      contentLoading:false,
      redirect:false
    }
  }

  componentDidMount = async() => {
    if (sessionStorage.getItem("jwt")){
      this.setState({jwtToken: sessionStorage.getItem("jwt")}, () => {this.VerifyJwt();});
    }
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

  GetUsers = async() => {
    const usersRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/getusers`, {mode:'cors'});
    const usersResponse = await usersRequest.json();
    let users = []
    for (let i=0;i<usersResponse.length;i++) {
      users.push({
        key:i,
        userId:String(usersResponse[i].users_id),
        firstName:usersResponse[i].users_first_name,
        lastName:usersResponse[i].users_last_name,
        email:usersResponse[i].users_email,
        accountType:usersResponse[i].at_name,
        role:usersResponse[i].roles_name,
        createdAt:usersResponse[i].users_created_at,
        status:usersResponse[i].users_enabled ? "enabled":"disabled"
      })
    }
    this.setState({usersList:users})

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
    this.setState({contentLoading:false,})
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
      mapCards:'block',
      facilityCards:'none',
      backButton:'block'
    })
  }

  HandleMenuClick = (menuItem) => {
    switch (menuItem) {
      case "users":
        this.GetUsers();
        break;
    }
  }

  render() {
    return (
      <>
        <GlobalHeader isAuth={this.state.isAuth} userInfo={this.state.userInfo}/>
        <div style={{display:'flex'}}>
          <div>
            <Menu
            style={{width: 256}}
            defaultSelectedKeys={['1']}
            onClick={(event) => this.HandleMenuClick(event.key)}
            mode="vertical"
            theme="light"
            items={[
              {key:'users', icon:<TeamOutlined />,label:'Users'},
              {key:'accounttypes',icon:<UserSwitchOutlined />,label:'Account Types'},
              {key:'roles',icon:<SolutionOutlined />,label:'User Roles'},
              {key:'offices',icon:<HomeOutlined />,label:'Offices'},
              {key:'facilities',icon:<ShopOutlined />,label:'Facilities'},
              {key:'maps',icon:<CompassOutlined />,label:'Maps'}
            ]}
            />
            </div>
        <div>
          <Table dataSource={this.state.usersList} columns={userColumns} />
        </div>
        </div>
        <div>
          {
            this.state.isAuth ? null:<>
              {this.state.loginRedirect ? <Navigate to="/login"/>:null}
              <Result
                status="403"
                title="403"
                subTitle="Sorry, you are not authorized to access this page."
                extra={<Button onClick={() => this.setState({loginRedirect:true})} type="primary">Login</Button>}
              />
            </>
          }
        </div>
      </>
    );
  };
}

export default AdminPage; 
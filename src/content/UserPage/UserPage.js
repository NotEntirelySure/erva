import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import entPortal from '../../assets/images/ERVA_Ent_Portal.jpg';
import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api'
import {
  Button,
  ClickableTile,
  Content,
  DataTable,
  Header,
  HeaderContainer,
  HeaderGlobalAction,
  HeaderGlobalBar,
  HeaderMenuButton,
  HeaderName,
  IconTab,
  Loading,
  SideNav,
  SideNavItems,
  SideNavLink,
  SkipToContent,
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  TableToolbarMenu,
  TableToolbarAction,
  Tabs,
  TabList,
  TabPanels,
  TabPanel,
  Tile
} from '@carbon/react';
import {
  Notification,
  Search,
  UserAvatar,
  ArrowLeft,
  ConnectionSend,
  Close,
  ImageCopy,
  List,
  Map,
  Switcher,
  View
} from '@carbon/react/icons';

import { Image } from 'antd';

import GlobalHeaderCarbon from '../../components/GlobalHeaderCarbon';

const facilityTableHeader = [
  {key:'name', header:'Name'},
  {key:'address', header:'Address'},
  {key:'city', header:'City'},
  {key:'state', header:'State'},
  {key:'zip', header:'Zip Code'},
  {key:'lat',header:'Latitude'},
  {key:'long',header:'Longitude'},
  {key:'action', header:'Action'}
]

const blueprintTableHeader = [
  {key:'imageId', header:'Image ID'},
  {key:'facility', header:'Facility'},
  {key:'name', header:'Image Name'},
  {key:'action', header:'Action'}
]

export default function UserPage() {

  const navigate = useNavigate();
  const { isLoaded } = useLoadScript({googleMapsApiKey:"AIzaSyB0gKIxB858FEBjRa7hq72cBaxemoQL5pQ"})
    
  const [officeList, setOfficeList] = useState([]);
  const [blueprintData, setBlueprintData] = useState([]);
  const [selectedOffice, setSelectedOffice] = useState({name:'',address:'',city:'',state:'',zip:'',lat:0,long:0});
  const [facilityData, setFacilityData] = useState([
    {
      id:'',
      facilityId:"",
      name:"",
      address:"",
      city:"",
      state:"",
      zip:"",
      image:'',
      lat:0,
      long:0,
      action:<></>
   }
  ]);
  const [selectedFacility, setSelectedFacility] = useState({name:'',address:'',city:'',state:'',zip:''});
  const [showFacilityData, setShowFacilityData] = useState('block');
  const [showBlueprintData, setShowBlueprintData] = useState('none');
  const [imageModalOpen, setImageModalOpen] = useState('none');
  const [imageModalImage, setImageModalImage] = useState();
  const [imageModalCaption, setImageModalCaption] = useState('');
  const [mapSideNavOpen, setMapSideNavOpen] = useState('none');
  const [mapCenter, setMapCenter] = useState({lat:0, lng:0})
  const [selectedTab, setSelectedTab] = useState(0);
  const [mapSideNavFacility, setMapSideNavFacility] = useState(0);
  const jwt = useRef(null);
  const [isAuth, setIsAuth] = useState(null);
  const [authErrorStatus, setAuthErrorStatus] = useState({status:"info",title:"",subTitle:""})
  const [locationList, setLocationList] = useState([]);
  const [userInfo, setUserInfo] = useState([]);
  const [blueprintInfo, setBlueprintInfo] = useState([]);
  const [tabsLoading, setTabsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [loadingDescription, setLoadingDescription] = useState('');
  const [contentLoading, setContentLoading] = useState('none');
  const [alertMessage, setAlertMessage] = useState({});
  const [facilityCards, setFacilityCards] = useState('block');
  const [blueprintCards, setBlueprintCards] = useState('none');
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
  },[]);

  useEffect(() => {verifyJwt()},[jwt.current]);
  useEffect(() => {
    setMapCenter({lat:parseFloat(selectedOffice.lat), lng:parseFloat(selectedOffice.long)})
  },[selectedOffice])

  async function verifyJwt() {
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
      setOfficeList(officeResponse);
      setSelectedOffice(officeResponse[0]);
      console.log(selectedOffice);
      setTabsLoading(false);
      if (officeResponse.length > 0) getFacilities(officeResponse[0].id);
      if (officeResponse.length === 0) {
        setShowWarning(true);
        setAlertMessage({
          type:'warning',
          description:'There are no offices assigned to your account. Please contact your account manager to add offices.',
          message:"No facilities to show"
        });
      };
    };
  };

  async function getApiKey() {

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
      );
    };
  };

  async function getFacilities(officeId) {
    setLoadingMessage("Getting Facilities");
    setLoadingDescription("Getting facilities associated to the selected office.");
    setFacilityCards('none');
    setContentLoading('block');
    const facilitiesRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/getfacilities`, {
      method:'POST',
      mode:'cors',
      headers:{'Content-Type':'application/json'},
      body:`{"token":"${jwt.current}","office":"${officeId}"}`
    });
    const facilitiesResponse = await facilitiesRequest.json();
    if (facilitiesResponse.length <= 0) {}
    if (facilitiesResponse.length > 0) {
      const facilitiesArray = facilitiesResponse.map(facility => ({
        ...facility,
        id:String(facility.facilityId),
        image:URL.createObjectURL(new Blob([new Uint8Array(facility.image.data)], { type: 'image/png' })),
        action:<>
          <Button
            hasIconOnly
            kind='tertiary'
            renderIcon={ConnectionSend}
            iconDescription="Go to Facility"
            onClick={() => getBlueprints(facility.facilityId)}
          />
        </>
      }

      ))
      setFacilityData(facilitiesArray);
    }
    setContentLoading('none');
    setFacilityCards('block');
    if (blueprintCards === 'block') setBlueprintCards('none');

  };

  async function getBlueprints(facilityId) {
    setBlueprintData([]);
    setShowFacilityData('none');
    setShowBlueprintData('block');
    setLoadingMessage("Getting blueprints");
    setLoadingDescription("Getting blueprints associated with the selected facility.");
    setContentLoading('block');
    const blueprintsRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/getblueprints`, {
      method:'POST',
      mode:'cors',
      headers:{'Content-Type':'application/json'},
      body:`{"token":"${jwt.current}","facility":"${facilityId}"}`
    });
    const blueprintsResponse = await blueprintsRequest.json();
    if (blueprintsResponse.length <= 0) {}
    if (blueprintsResponse.length > 0) {
      setBlueprintData(blueprintsResponse);
    }
    setContentLoading('none');
    setFacilityCards('none');
    setBlueprintCards('block');
  };

  function LoadingTiles(props) {
    const elementsArray = [];
    for (let i=0;i<props.quantity;i++) {
      elementsArray.push(
        <div className='tile'>
          <Tile
            key={i}
            children={
              <>
                <ImageCopy size={128}/>
                <hr/>
                <p style={{marginTop:'1rem'}}><strong>Loading...</strong></p>
              </>
            }
          />
        </div>
      );
    };
    return elementsArray;
  };

  return (
    <>
      <div className="imageModal" style={{display:imageModalOpen}} onClick={() => setImageModalOpen('none')}>
        <img className="imageModalContent" alt={imageModalCaption} src={imageModalImage}/>
        <div id="imageModalCaption" style={{paddingLeft:'20%'}}><h4>{imageModalCaption}</h4></div>
      </div>
      <HeaderContainer
        render={({ isSideNavExpanded, onClickSideNavExpand }) => (
          <>
            <Header aria-label="ERVA">
              <SkipToContent />
              <HeaderMenuButton
                aria-label="Open menu"
                onClick={onClickSideNavExpand}
                isActive={isSideNavExpanded}
              />
              <HeaderName href="/" prefix="ERVA">
                [Emergency Response Visual Aid]
              </HeaderName>
              <HeaderGlobalBar>
                <HeaderGlobalAction
                  aria-label="Search"
                  onClick={() => {}}>
                  <Search size={20} />
                </HeaderGlobalAction>
                <HeaderGlobalAction
                  aria-label="Notifications"
                  onClick={() => {}}>
                  <Notification size={20} />
                </HeaderGlobalAction>
                <HeaderGlobalAction
                  aria-label="Account"
                  onClick={() => {}}
                  tooltipAlignment="end">
                  <UserAvatar size={20} />
                </HeaderGlobalAction>
              </HeaderGlobalBar>
              <SideNav aria-label="Side navigation" expanded={isSideNavExpanded}>
                <SideNavItems>
                {
                  officeList && (officeList.map(office => (
                    <SideNavLink
                      key={office.id}
                      onClick={() => {
                        getFacilities(office.id);
                        setSelectedOffice(office);
                      }}
                      children={office.name}
                      isActive={office.name === selectedOffice.name ? true:false}
                    />
                  )))
                }
                </SideNavItems>
              </SideNav>
            </Header>
          </>
        )}
      />
      <Content>
        <div className='infoRow'>
          <div className='officeNameContainer'>
            <p style={{fontWeight:'bold',color:'red'}}>{selectedOffice.name}</p>
            <p>{selectedOffice.address}</p>
            <p>{selectedOffice.city}, {selectedOffice.state} {selectedOffice.zip}</p>
          </div>
          <div><img className='logo' src={entPortal}></img></div>
        </div>
        <hr/>
        <div id="facilityData" style={{display:showFacilityData}}>
        <div style={{display:contentLoading}}><Loading withOverlay={false} description='Loading...'/></div>
          <div className="tabsHeader">
            <div id="officeHeader">
            </div>
            <Tabs selectedIndex={selectedTab}>
              <TabList aria-label='office tabs'>
                <IconTab label='Grid view' onClick={()=>setSelectedTab(0)}>
                  <Switcher aria-label="grid view" size={20} />
                </IconTab>
                <IconTab label='List view' onClick={()=>setSelectedTab(1)}>
                  <List aria-label='list view' size={20} />
                </IconTab>
                <IconTab label='Map view' onClick={()=>{setSelectedTab(2);console.log("selected: ",selectedTab)}}>
                  <Map aria-label='map view' size={20}/>
                </IconTab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <div className='gridContainer'>
                    {/* <div className='loadingTiles'><LoadingTiles quantity={10}/></div> */}
                    {
                      facilityData.map(facility => (
                        <div className='tile'>
                          <ClickableTile
                            key={facility.facilityId}
                            onClick={() => {
                              setSelectedFacility(facility);
                              getBlueprints(facility.facilityId);
                            }}
                            children={
                              <>
                                <img className="tileImage" alt={facility.name} src={facility.image}></img>
                                <p style={{marginTop:'1rem'}}><strong>{facility.name}</strong></p>
                                <hr/>
                                <p>{facility.address}</p>
                                <p>{facility.city}, {facility.state} {facility.zip}</p>
                              </>
                            }
                          />
                        </div>    
                      ))
                    }
                  </div>
                </TabPanel>
                <TabPanel>
                  <div className='listContainer'>
                    <DataTable rows={facilityData} headers={facilityTableHeader} isSortable>
                      {({
                        rows,
                        headers,
                        getHeaderProps,
                        getRowProps,
                        getTableProps,
                        getToolbarProps,
                        onInputChange,
                      }) => (
                        <TableContainer 
                          title={`${selectedOffice.name} Facilities`}
                          description={`Displays a list of all facilities currently registered under ${selectedOffice.name}`}
                        >
                          <TableToolbar {...getToolbarProps()} aria-label="data table toolbar">
                            <TableToolbarContent>
                              <TableToolbarSearch onChange={onInputChange} />
                              <TableToolbarMenu light>
                                <TableToolbarAction onClick={()=>{}}>
                                  Action 1
                                </TableToolbarAction>
                                <TableToolbarAction onClick={()=>{}}>
                                  Action 2
                                </TableToolbarAction>
                                <TableToolbarAction onClick={()=>{}}>
                                  Action 3
                                </TableToolbarAction>
                              </TableToolbarMenu>
                              <Button onClick={()=>{}}>Primary Button</Button>
                            </TableToolbarContent>
                          </TableToolbar>
                          <Table {...getTableProps()}>
                            <TableHead>
                              <TableRow>
                                {headers.map((header) => (
                                  <TableHeader key={header.key} {...getHeaderProps({ header })}>
                                    {header.header}
                                  </TableHeader>
                                ))}
                                <TableHeader />
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {rows.map((row) => (
                                <TableRow key={row.id} {...getRowProps({ row })}>
                                  {row.cells.map((cell) => (
                                    <TableCell key={cell.id}>{cell.value}</TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </DataTable>
                  </div>
                </TabPanel>
                <TabPanel>
                  <>
                  <div className='mapContainer'>
                    <div id='mapSideNav' style={{display:mapSideNavOpen}}>
                    {
                      facilityData && (<>
                        <div style={{textAlign:'right'}}><Close style={{cursor:'pointer'}} onClick={() => setMapSideNavOpen('none')} size={24}/></div>
                        <img className="mapSideNavImage" alt={facilityData[mapSideNavFacility].name} src={facilityData[mapSideNavFacility].image}/>
                        <p><strong>{facilityData[mapSideNavFacility].name}</strong></p>
                        <p>{facilityData[mapSideNavFacility].address}</p>
                        <p>{facilityData[mapSideNavFacility].city} {facilityData[mapSideNavFacility].state} {facilityData[mapSideNavFacility].zip}</p>
                        <div style={{textAlign:'right', paddingTop:'2rem'}}>{facilityData[mapSideNavFacility].action}</div>
                      </>)
                    }
                    </div>
                    {
                      !isLoaded ? <div><p>loading...</p></div>:
                      <div>
                        <GoogleMap
                          //options={{mapId:"d47737aa5628c2d4"}}
                          zoom={10}
                          center={mapCenter}
                          mapContainerClassName={"mapContainer"}
                          onLoad={()=>{}}
                          >
                          {
                            facilityData.map((item, index) => {
                              return (
                                <MarkerF 
                                  onClick={() => {
                                    setMapSideNavFacility(index);
                                    setSelectedFacility(facilityData[index]);
                                    setMapSideNavOpen('block');
                                    setMapCenter({lat:parseFloat(item.lat), lng:parseFloat(item.long)})
                                  }}
                                  title={item.name}
                                  key={item.facilityId}
                                  position={{lat:parseFloat(item.lat), lng:parseFloat(item.long)}}
                                >
                                </MarkerF>
                              )
                            })
                          }
                        </GoogleMap>
                      </div>
                    }
                  </div>
                    </>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </div>
        </div>
        <div id="blueprintData" style={{display:showBlueprintData}}>
          <div className='backButtonHeader'>
            <Button
              size='md'
              hasIconOnly
              renderIcon={ArrowLeft}
              kind="tertiary"
              tooltipPosition="bottom"
              iconDescription="Back"
              onClick={() => {
                setShowFacilityData('block');
                setShowBlueprintData('none');
              }}
            />
          </div>
          <div className="tabsHeader">
          <div className="facilityHeader">
            <div>
              <p><strong>{selectedFacility.name}</strong></p>
              <p>{selectedFacility.address}</p>
              <p>{selectedFacility.city}, {selectedFacility.state} {selectedFacility.zip}</p>
            </div>
            <div>
              <Button 
                onClick={() => getApiKey()}
                renderIcon={View}
                children={"Wayfind"}
              />
            </div>
          </div>
            <Tabs>
              <TabList aria-label='facility tabs'>
                <IconTab label='Grid view'>
                  <Switcher aria-label="grid view" size={20}/>
                </IconTab>
                <IconTab label='List view'>
                  <List aria-label='list view' size={20}/>
                </IconTab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <div className='gridContainer'>
                    {
                      blueprintData.map(blueprint => {
                        return (
                          <div>
                            <Tile key={blueprint.id} title={blueprint.name} className='locationCard'>
                            <Image src={URL.createObjectURL(new Blob([new Uint8Array(blueprint.image.data)], { type: 'image/png' }))} alt={blueprint.name}/>
                            </Tile>
                          </div>
                        )
                      })
                    }
                  </div>
                </TabPanel>
                <TabPanel>
                  <div className='listContainer'>
                    <DataTable rows={blueprintData} headers={blueprintTableHeader} isSortable>
                      {({
                        rows,
                        headers,
                        getHeaderProps,
                        getRowProps,
                        getTableProps,
                        getToolbarProps,
                        onInputChange,
                      }) => (
                        <TableContainer 
                          title={`${selectedFacility.name} Blueprints`}
                          description={`Displays a list of all blueprint images for ${selectedFacility.name}`}
                        >
                          <TableToolbar {...getToolbarProps()} aria-label="data table toolbar">
                            <TableToolbarContent>
                              <TableToolbarSearch onChange={onInputChange} />
                              <TableToolbarMenu light>
                                <TableToolbarAction onClick={()=>{}}>
                                  Action 1
                                </TableToolbarAction>
                                <TableToolbarAction onClick={()=>{}}>
                                  Action 2
                                </TableToolbarAction>
                                <TableToolbarAction onClick={()=>{}}>
                                  Action 3
                                </TableToolbarAction>
                              </TableToolbarMenu>
                              <Button onClick={()=>{}}>Primary Button</Button>
                            </TableToolbarContent>
                          </TableToolbar>
                          <Table {...getTableProps()}>
                            <TableHead>
                              <TableRow>
                                {headers.map((header) => (
                                  <TableHeader key={header.key} {...getHeaderProps({ header })}>
                                    {header.header}
                                  </TableHeader>
                                ))}
                                <TableHeader />
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {rows.map((row) => (
                                <TableRow key={row.id} {...getRowProps({ row })}>
                                  {row.cells.map((cell) => (
                                    <TableCell key={cell.id}>{cell.value}</TableCell>
                                  ))}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      )}
                    </DataTable>
                  </div>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </div>
        </div>
      </Content>
    </>
  )
}
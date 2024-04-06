import React, { 
  useState,
  useEffect,
  useRef,
  useMemo,
  useContext
} from 'react';
import { useNavigate } from 'react-router-dom';
import { DataContext } from '../../components/DataContext/DataContext';
import entPortal from '../../assets/images/ERVA_Ent_Portal.jpg';
import GlobalHeader from '../../components/GlobalHeader/GlobalHeader';
import { GoogleMap, useLoadScript, MarkerF } from '@react-google-maps/api'
import {
  Button,
  ClickableTile,
  Content,
  DataTable,
  DataTableSkeleton,
  IconTab,
  SkipToContent,
  SkeletonPlaceholder,
  SkeletonText,
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
  Tile,
  InlineNotification
} from '@carbon/react';
import {
  ArrowLeft,
  Close,
  ConnectionSend,
  List,
  Map,
  Notification,
  Switcher,
  View
} from '@carbon/react/icons';

import { Image } from 'antd';

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
  {key:'id', header:'Image ID'},
  {key:'name', header:'Image Name'},
  {key:'imageElement', header:'Image'}
]

export default function UserPage() {
  
  const navigate = useNavigate();
  const { isLoaded } = useLoadScript({googleMapsApiKey:process.env.GOOGLE_MAPS_API_KEY})
  const jwt = useRef(sessionStorage.getItem('ervaJwt'));

  const { contextData, setContextData } = useContext(DataContext);

  const [organizationList, setOrganizationList] = useState([{name:'',address:'',city:'',state:'',zip:'',lat:0,long:0}]);
  const [blueprintData, setBlueprintData] = useState([]);
  const [facilityData, setFacilityData] = useState([]);
  const [selectedFacility, setSelectedFacility] = useState({name:'',address:'',city:'',state:'',zip:''});
  const [showFacilityData, setShowFacilityData] = useState('block');
  const [showFacilitiesNotification, setShowFacilitiesNotification] = useState(false);
  const [showBlueprintData, setShowBlueprintData] = useState('none');
  const [mapSideNavOpen, setMapSideNavOpen] = useState('none');
  const [mapCenter, setMapCenter] = useState({lat:0, lng:0})
  const [selectedTab, setSelectedTab] = useState(0);
  const [mapSideNavFacility, setMapSideNavFacility] = useState(0);
  const [locationList, setLocationList] = useState([]);
  const [loadingState, setLoadingState] = useState({
    organizationsLoading:true,
    facilitiesLoading:true,
    mapLoading:true,
    blueprintsLoading:true
  })

  useEffect(() => {getInitialData()},[]);
  
  useEffect(() => {
    setMapCenter({
      lat:parseFloat(contextData.selectedOrganization.lat),
      lng:parseFloat(contextData.selectedOrganization.long)
    });
    if (parseInt(contextData.selectedOrganization.id) > 0) getFacilities(contextData.selectedOrganization.id);
  },[contextData.selectedOrganization])

  async function getInitialData() {
    setLoadingState(prevState => ({
      ...prevState,
      organizationsLoading:true
    }));
    const query = `
      query {
        getUserInfo(jwt:"${jwt.current}"){
          id
          firstName
          lastName
          email
          type
        }
        getOrganizations(jwt:"${jwt.current}") {
          id
          name
          address
          city
          state
          zip
        }
      }
    `;
    const dataRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api`, {
      method:'POST',
      mode:'cors',
      headers:{
        'Content-Type':'application/json',
        Accept:'application/json',
        Authorization:`Bearer ${jwt.current}`
      },
      body:JSON.stringify({ query })
    });
    const dataResponse = await dataRequest.json();
    if (dataResponse.data) {
      if (dataResponse.data.getOrganizations.length === 0) {
        setContextData(prevState => (
          {
            ...prevState,
            userInfo:dataResponse.data.getUserInfo
          }
        ));
        setLoadingState(prevState => ({
          ...prevState,
          facilitiesLoading:false
        }));
      };
      if (dataResponse.data.getOrganizations.length > 0) {
        setContextData({
          userInfo:dataResponse.data.getUserInfo,
          selectedOrganization:dataResponse.data.getOrganizations[0]
        });
        setOrganizationList(dataResponse.data.getOrganizations);
      }
      setLoadingState(prevState => ({
        ...prevState,
        organizationsLoading:false
      }));
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

  async function getFacilities(organizationId) {
    if (showFacilitiesNotification) setShowFacilitiesNotification(false);
    setLoadingState(prevState => (
      {
        ...prevState,
        facilitiesLoading:true,
        mapLoading:true
      }
    ));
    const query = `
      query {
        getFacilities(jwt:"${jwt.current}", organizationId:${organizationId}) {
          id
          name
          address
          city
          state
          zip
          lat
          long
          code
          image {
            success
            message
            name
            data
          }
        }
      }
    `
    const facilitiesRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api`, {
      method:'POST',
      mode:'cors',
      headers:{
        'Content-Type':'application/json',
        Accept:'application/json',
        Authorization:`Bearer ${jwt.current}`
      },
      body:JSON.stringify({ query })
    });
    const facilitiesResponse = await facilitiesRequest.json();
    if (facilitiesResponse.errors) {}
    if (facilitiesResponse.data) {
      if (facilitiesResponse.data.getFacilities.length < 1) {
        setShowFacilitiesNotification(true);
        setLoadingState(prevState => (
          {
            ...prevState,
            facilitiesLoading:false,
            mapLoading:false
          }
        ));
        return;
      }
      const facilitiesArray = facilitiesResponse.data.getFacilities.map(facility => (
        {
          ...facility,
          id:String(facility.id),
          facilityId:facility.id,
          action:<>
            <Button
              hasIconOnly
              kind='tertiary'
              renderIcon={ConnectionSend}
              iconDescription="Go to Facility"
              onClick={() => getBlueprints(facility.id)}
            />
          </>
        }
      ));
      setFacilityData(facilitiesArray);
      setLoadingState(prevState => (
        {
          ...prevState,
          facilitiesLoading:false,
          mapLoading:false
        }
      ));
    };
  };

  async function getBlueprints(facilityId) {
    setBlueprintData([]);
    setShowFacilityData('none');
    setShowBlueprintData('block');
    setLoadingState(prevState => ({
      ...prevState,
      blueprintsLoading:true
    }));
    try {
      const query = `
        query {
          getBlueprints (jwt:"${jwt.current}", facilityId:${facilityId}) {
            id
            name
            image {
              success
              message
              name
              data
            }
          }
        }
      `;
      const blueprintsRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api`, {
        method:'POST',
        mode:'cors',
        headers:{
          'Content-Type':'application/json',
          Accept:'application/json',
          Authorization:`Bearer ${jwt.current}`
        },
        body:JSON.stringify({ query })
      });
      const blueprintsResponse = await blueprintsRequest.json();
      if (blueprintsResponse.errors) {} //add error condition
      if (blueprintsResponse.data) {
        const blueprints = blueprintsResponse.data.getBlueprints.map(blueprint => (
          {
            ...blueprint,
            imageElement:<Image style={{zIndex:'5'}} width={200} src={`data:image/png;base64,${blueprint.image.data}`} alt={blueprint.name}/>
          }
        ))
        setBlueprintData(blueprints);
      }
    }
    catch(error) {
      console.log(error);
    }
    setLoadingState(prevState => ({
      ...prevState,
      blueprintsLoading:false
    }));
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
                <SkeletonPlaceholder/>
                <br/>
                <SkeletonText/>
                <hr/>
                <SkeletonText/>
                <SkeletonText/>
              </>
            }
          />
        </div>
      );
    };
    return elementsArray;
  };
  function FacilitiyTiles(props) {
    if (props.loading) {
      const elementsArray = [];
      for (let i=0;i<6;i++) {
        elementsArray.push(
          <div className='tile'>
            <Tile
              key={i}
              children={
                <>
                  <SkeletonPlaceholder/>
                  <br/>
                  <SkeletonText/>
                  <hr/>
                  <SkeletonText/>
                  <SkeletonText/>
                </>
              }
            />
          </div>
        );
      };
      return elementsArray;
    };
    if (!props.loading && props.data.length > 0) {
      const facilities = facilityData.map(facility => (
        <div className='tile'>
          <ClickableTile
            key={facility.id}
            onClick={() => {
              setSelectedFacility(facility);
              getBlueprints(facility.id);
            }}
            children={
              <>
                <img 
                  className="tileImage"
                  alt={facility.name}
                  src={`data:image/png;base64,${facility.image.data}`}
                />
                <p style={{marginTop:'1rem'}}><strong>{facility.name}</strong></p>
                <hr/>
                <p>{facility.address}</p>
                <p>{facility.city}, {facility.state} {facility.zip}</p>
              </>
            }
          />
        </div>
      ));
      return facilities;
    };
    if (!props.loading && props.data.length === 0) {
      return (
        <InlineNotification
          hideCloseButton={true}
          kind='warning'
          title='Nothing to display' 
          subtitle='No facilities are assigned to your account or none exist under the selected organization.'
        />
      )
    }
  };

  return (
    <>
      <GlobalHeader
        isAuth={true}
        showNav={true}
        orgs={organizationList}
        orgsLoading={loadingState.organizationsLoading}
      />
      <Content>
        <div className='infoRow'>
          <div className='officeNameContainer'>
            <>
              <p style={{fontWeight:'bold',color:'red'}}>{contextData.selectedOrganization.name}</p>
              <p>{contextData.selectedOrganization.address}</p>
              <p>{contextData.selectedOrganization.city}, {contextData.selectedOrganization.state} {contextData.selectedOrganization.zip}</p>
            </>
          </div>
          <div><img className='logo' src={entPortal}></img></div>
        </div>
        <hr/>
        <div id="facilityData" style={{display:showFacilityData}}>
          <div className="tabsHeader">
            <div id="officeHeader">
            </div>
            <Tabs selectedIndex={selectedTab}>
              <TabList aria-label='office tabs'>
                <IconTab label='Grid view' onClick={()=> setSelectedTab(0)}>
                  <Switcher aria-label="grid view" size={20} />
                </IconTab>
                <IconTab label='List view' onClick={()=> setSelectedTab(1)}>
                  <List aria-label='list view' size={20} />
                </IconTab>
                <IconTab label='Map view' onClick={()=> setSelectedTab(2)}>
                  <Map aria-label='map view' size={20}/>
                </IconTab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <div className='gridContainer'>
                    <FacilitiyTiles loading={loadingState.facilitiesLoading} data={facilityData}/>
                  </div>
                </TabPanel>
                <TabPanel>
                  <div className='listContainer'>
                    { loadingState.facilitiesLoading && (<DataTableSkeleton rows={6} columnCount={8}/>) }
                    { !loadingState.facilitiesLoading && (
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
                          title={`${contextData.selectedOrganization.name} Facilities`}
                          description={`Displays a list of all facilities currently registered under ${contextData.selectedOrganization.name}`}
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
                    )}
                  </div>
                </TabPanel>
                <TabPanel>
                  <>
                  <div className='mapContainer'>
                    <div id='mapSideNav' style={{display:mapSideNavOpen}}>
                    {
                      facilityData && (<>
                        <div style={{textAlign:'right'}}><Close style={{cursor:'pointer'}} onClick={() => setMapSideNavOpen('none')} size={24}/></div>
                        <img 
                          className="mapSideNavImage"
                          alt={facilityData[mapSideNavFacility] && (facilityData[mapSideNavFacility].name)}
                          src={facilityData[mapSideNavFacility] && (facilityData[mapSideNavFacility].image)}
                        />
                        <p><strong>{facilityData[mapSideNavFacility] && (facilityData[mapSideNavFacility].name)}</strong></p>
                        <p>{facilityData[mapSideNavFacility] && (facilityData[mapSideNavFacility].address)}</p>
                        <p>
                          {facilityData[mapSideNavFacility] && (facilityData[mapSideNavFacility].city)} {facilityData[mapSideNavFacility] && (facilityData[mapSideNavFacility].state)} {facilityData[mapSideNavFacility] && (facilityData[mapSideNavFacility].zip)}
                        </p>
                        <div 
                          style={{textAlign:'right', paddingTop:'2rem'}}>
                          {facilityData[mapSideNavFacility] && (facilityData[mapSideNavFacility].action)}
                        </div>
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
                    { loadingState.blueprintsLoading && (<LoadingTiles quantity={6}/>)}
                    { !loadingState.blueprintsLoading && (
                      blueprintData.map(blueprint => {
                        return (
                          <div>
                            <Tile key={blueprint.id} title={blueprint.name} className='locationCard'>
                            <Image src={`data:image/png;base64,${blueprint.image.data}`} alt={blueprint.name}/>
                            </Tile>
                          </div>
                        )
                      })
                    )}
                  </div>
                </TabPanel>
                <TabPanel>
                  <div className='listContainer'>
                    { loadingState.blueprintsLoading && (<DataTableSkeleton rowCount={6} columnCount={3}/>) }
                    {
                      !loadingState.blueprintsLoading && (
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
                    )}
                  </div>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </div>
        </div>
      </Content>
    </>
  );
};
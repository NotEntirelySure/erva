import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  CAMERA_EASING_MODE,
  getVenue,
  showVenue,
  E_BLUEDOT_EVENT,
  E_BLUEDOT_STATE,
  E_BLUEDOT_STATE_REASON,
  E_SDK_EVENT,
  PositionUpdater,
  OfflineSearch
} from "@mappedin/mappedin-js";
import "@mappedin/mappedin-js/lib/mappedin.css";
import {
  Checkbox,
  Divider,
  List
} from 'antd';
import {
  CloseOutlined
} from '@ant-design/icons';
import {
  Accordion,
  AccordionItem,
  ActionableNotification,
  Button,
  ButtonSet,
  ContainedList,
  ContainedListItem,
  Content,
  ClickableTile,
  Dropdown,
  DropdownSkeleton,
  IconButton,
  Layer,
  Loading,
  Modal,
  Search,
  SideNavDivider,
  Stack,
  TextInput,
  Toggle
} from '@carbon/react';
import {
  Add,
  CloseOutline,
  Location,
  LocationFilled,
  NavaidMilitaryCivil,
  RightPanelCloseFilled,
  SettingsAdjust,
  SidePanelCloseFilled,
  SidePanelOpenFilled,
  TrashCan
} from '@carbon/react/icons';
import GlobalHeader from '../../components/GlobalHeader/GlobalHeader';
import { ReactComponent as defaultLocation } from '../../assets/images/noun-room-3368532.svg'

export default function MapPage() {

  let positionData = {
    timestamp: Date.now(),
    coords: {
      accuracy: 5,
      latitude: 43.51905183293411,
      longitude: -80.53701846381122,
      floorLevel: 0
    }
  };

  const location = useLocation();
  const mapRef = useRef(null);
  const mapComponents = useRef({});
  const svgData = useRef([{icon:'',data:''}]);
  const jwt = useRef(sessionStorage.getItem('ervaJwt'));
  const selectedPolygon = useRef({id:''});
  const onClickListener = useRef(false);
  const addComponentListener = useRef({
    listening: false,
    componentId:-1
  })

  const [venue, setVenue] = useState();
  const [mapView, setMapView] = useState();
  const [levels, setLevels] = useState();
  const [components, setComponents] = useState([]);
  const [sideNavPosition, setSideNavPosition] = useState('translate(0rem,0rem)');
  const [sideNavArrowPosition, setSideNavArrowPosition] = useState('');
  const [mapOptionsPosition, setMapOptionsPosition] = useState('translate(25rem,0rem)');
  const [contentLoading, setContentLoading] = useState(false);
  const [venueDirectory, setVenueDirectory] = useState();
  const [showDestSearchBar, setShowDestSearchBar] = useState(true);
  const [startSearchResults, setStartSearchResults] = useState([]);
  const [destSearchResults, setDestSearchResults] = useState([]);
  const [showStartSearchBar, setShowStartSearchBar] = useState(false);
  const [showLocationInfo, setShowLocationInfo] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [startLocation, setStartLocation] = useState({name:'',polygonId:''});
  const [directionsInstructions, setDirectionsInstructions] = useState([]);
  const [displayTbtDirections, setDisplayTbtDirections] = useState(false);
  const [currentJourney, setCurrentJourney] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState({
    polygonId:'',
    type:'init',
    color:'',
    name:'',
    lat:'',
    long:'',
    icon:''
  });

  const options = {
    venue: "mappedin-demo-mall", //location.state.faciilityCode
    clientId: "5eab30aa91b055001a68e996",
    clientSecret: "RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1" //location.state.apiKey - I may want to get the API key at the time of load instead of passing the value using location.state.
  };

  // const options = {
  //   venue: location.state.facilityCode,
  //   clientId: "6616d537a89505c89c59f2a2",
  //   clientSecret: "nGytExsX3kTyJk5bk9nsTkYYcNK5GUucm1btKV68p8MRXUT1",
  // };

  useEffect(() => {
    loadMap();
  },[]);
  
  useEffect(() => {getDirections();},[startLocation]);
  useEffect(() => {
    if (mapView) {
      mapView.StackedMaps.enable({verticalDistanceBetweenMaps: 125})
      try {
        GetComponents();
        mapView.addInteractivePolygonsForAllLocations();
        mapView.labelAllLocations({flatLabels: true})
        mapView.on(E_SDK_EVENT.CLICK, event => {
          if (addComponentListener.current.listening) {
            const data = {
              floor:event.maps[0].elevation + 1,
              lat:event.position.latitude,
              long:event.position.longitude,
              facilityId:parseInt(location.state.facilityId),
              componentId:addComponentListener.current.componentId
            };
            AddMapComponent(data);
          }
          if (!event.polygons.length && !event.floatingLabels.length) {
            if (!currentJourney.length) {
              setShowDestSearchBar(true);
              setShowStartSearchBar(false);
              setShowLocationInfo(false);
              setSelectedLocation({
                type:'',
                color:'',
                name:'',
                lat:'',
                long:'',
                icon:''
              });
              if (onClickListener.current) onClickListener.current = false;
            };
          };

          if (event.polygons.length && !currentJourney.length) {
            const locationData = {
              polygonId:event.polygons[0].id,
              source:'location',
              type:'Room',
              name:event.polygons[0].locations[0].name,
              color:'#78a9ff',
              lat:event.polygons[0].locations[0].nodes[0].lat,
              long:event.polygons[0].locations[0].nodes[0].lon,
              icon:event.polygons[0].locations[0].logo ? event.polygons[0].locations[0].logo.original:<><svg>{defaultLocation}</svg></>
            };
            if (onClickListener.current) {
              setStartLocation(locationData);
              return;
            };
            if (!onClickListener.current) {
                setSelectedLocation(locationData);
                setShowLocationInfo(true);
                setShowDestSearchBar(false);
                handlePaneView("left","open");
              if (event.polygons[0].id !== selectedPolygon.current.id) mapView.clearPolygonColor(selectedPolygon.current);
              mapView.setPolygonColor(event.polygons[0], "#BF4320");
              mapView.Camera.focusOn(
                { polygons: event.polygons },
                {
                  updateZoomLimits: true,
                  changeZoom: true,
                  rotation:0,
                  tilt:0.5,
                  minZoom:1500,
                  duration: 1250,
                  easing: CAMERA_EASING_MODE.EASE_OUT
                }
              );
              selectedPolygon.current = event.polygons[0];
            };
          
          }
          else {mapView.clearPolygonColor(selectedPolygon.current)};

          if (event.floatingLabels.length) {
            if (onClickListener.current) {
              setStartLocation({
                ...mapComponents.current[event.floatingLabels[0].id],
                polygonId:event.floatingLabels[0].id
              });
              return;
            };
            mapView.Camera.focusOn(
              { nodes: event.floatingLabels },
              {
                pdateZoomLimits: true,
                changeZoom: true,
                rotation:0,
                tilt:0.5,
                minZoom:1500,
                duration: 1250,
                easing: CAMERA_EASING_MODE.EASE_OUT
              }
            );
            setSelectedLocation({
              ...mapComponents.current[event.floatingLabels[0].id],
              polygonId:event.floatingLabels[0].id,
            }); 
            setShowLocationInfo(true);
            setShowDestSearchBar(false);
            handlePaneView("left","open");
          };
          if (onClickListener.current) onClickListener.current = false;
        });
        // const staticPositionUpdater = new PositionUpdater();
        // setInterval(() => {
        //   navigator.geolocation.getCurrentPosition(position => {
        //     staticPositionUpdater.update(position);
        //   })
        // }, 10000);
        // mapView.BlueDot.enable({
        //   positionUpdater: staticPositionUpdater,
        //   smoothing: false
        // });
      
        // staticPositionUpdater.update(positionData);
      
        // mapView.BlueDot.on(E_BLUEDOT_EVENT.POSITION_UPDATE, update => {
        //   console.info(update.position);
        // });
      
        // mapView.BlueDot.on(E_BLUEDOT_EVENT.STATE_CHANGE, state => {
        //   const stateWithNames = {
        //     state: E_BLUEDOT_STATE[state.name],
        //     reason: state.reason && E_BLUEDOT_STATE_REASON[state.reason]
        //   };
        //   console.info(stateWithNames);
        // });
      }
      catch (error) {console.log(error)}
    };
  },[mapView]);

  async function loadMap() {
    setContentLoading(true);
    const venueData = await getVenue(options);
    // Update state variable after data is fetched
    setVenue(venueData);
    const levelsArray = [];
    venueData.maps.sort(
      (a, b) => a.elevation - b.elevation).forEach(level => {
        levelsArray.push({
          value:level.id,
          label:level.name,
          shortName:level.shortName
        })
      }
    );
    setLevels(levelsArray);
    
    const directory = new OfflineSearch(venueData)
    setVenueDirectory(directory);
    if (mapRef.current === null || venueData === null) {
      setContentLoading(false);
      return;
    };
    // Do nothing if the mapView is already rendered with the current venue data
    if (mapView != null && mapView.venue.venue.id === venue.venue.id) {
      setContentLoading(false);
      return;
    };
    // If the mapView has been rendered with old data, destroy it
    if (mapView != null) mapView.destroy();
    // Try to render the mapView
    try {
      const _mapView = await showVenue(mapRef.current, venueData, {
        multiBufferRendering: true,
        xRayPath: true,
        loadOptions: {
          outdoorGeometryLayers: [
            "__TEXT__",
            "__AUTO_BORDER__",
            "Void",
            "Base",
            "Tarmac",
            "Landscape",
            "Floor Shadow",
            "Airplanes",
            "Airplane Shadows",
            "Walkways"
          ]
        }
      });
      setMapView(_mapView);
    }
    catch (error) {
      // Handle error
      console.log(error);
      setMapView(undefined);
    }
    setContentLoading(false);
  }

  async function GetComponents () {
    
    const query = `query {
      getComponents (jwt:"${jwt.current}") {
        components {
          componentId
          categoryName
          componentType
          componentName
          componentIcon
          componentColor
        }
        svgData {
          success
          message
          data
          name
        }
      }
      getMapComponents (jwt:"${jwt.current}", facilityId:${location.state.facilityId}) {
        id
        type
        color
        name
        lat
        long
        floor
        icon
      }
    }`;
    const componentRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api`,{
      mode:'cors',
      method:'POST',
      headers: {
        'Content-Type':'application/json',
        Accept:'application/json',
        Authorization:`Bearer ${jwt.current}`
      },
      body:JSON.stringify({query})
    });
    const componentResponse = await componentRequest.json();
    
    if (componentResponse.data.getComponents) {
      const svgs = componentResponse.data.getComponents.svgData.map(item => (
        {
          icon:item.name,
          data:atob(item.data)
        }
      ));
      svgData.current = svgs;
      setComponents(componentResponse.data.getComponents.components);
    };

    if (componentResponse.data.getMapComponents) {
      mapView.FloatingLabels.removeAll();
      componentResponse.data.getMapComponents.forEach(component => {
        const floor = component.floor ? component.floor - 1:0;
        const coordinate = venue.maps[floor].createCoordinate(component.lat, component.long);
        const label = mapView.FloatingLabels.add(
          coordinate,
          component.name, {
            interactive:true,
            appearance: {
              marker: {
                iconSize: 20,
                backgroundColor: {
                  active: "black",
                  inactive: "transparent",
                },
                foregroundColor: {
                  active: component.color,
                  inactive: "transparent",
                },
                icon:svgData.current.find(svg => svg.icon === component.icon).data
              },
            }
          }
        );
        mapComponents.current[label.id] = {...component, source:"marker"};
      });
    };
    if (componentResponse.errors) {};
  };

  async function AddMapComponent(componentData) {
    setShowNotification(false);
    const query = `
      mutation ($token:String!, $data: NewMapComponent!) {
        addMapComponent(jwt: $token, component: $data) {
          success
          message
        }
      }
    `;

    const addRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api`,{
      mode:'cors',
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        Accept:'application/json',
        Authorization:`Bearer ${jwt.current}`
      },
      body:JSON.stringify({
        query,
        variables: { 
          data: componentData,
          token: jwt.current
        }
      })
    });
    const addResponse = await addRequest.json();
    if (addResponse.data.addMapComponent.success) GetComponents();
    addComponentListener.current = {listening: false, componentId:-1};
  };

  async function DeleteMapComponent () {
    setDeleteModalOpen(false);
    if (selectedLocation.id && selectedLocation.source === "marker") {
      const query = `
        mutation ($token:String!, $data: Int!) {
          deleteMapComponent(jwt: $token, componentId: $data) {
            success
            message
          }
        }
      `;

      const deleteRequest = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api`,{
        mode:'cors',
        method:'POST',
        headers:{
          'Content-Type':'application/json',
          Accept:'application/json',
          Authorization:`Bearer ${jwt.current}`
        },
        body:JSON.stringify({
          query,
          variables: { 
            data: parseInt(selectedLocation.id),
            token: jwt.current
          }
        })
      });
      const deleteResponse = await deleteRequest.json();
      if (deleteResponse.data.deleteMapComponent.success) GetComponents();

    };
  };

  function handlePaneView(pane, state) {
    switch (pane) {
      case "left":
        switch (state) {
          case "open":
            setSideNavPosition('translate(0rem,0rem)');
            setSideNavArrowPosition('translate(-10rem,0rem)');
            break;
          case "close":
            setSideNavPosition('translate(-25rem,0rem)');
            setSideNavArrowPosition('translate(9rem,0rem)');
            break;
        };
        break;
      case "right":
        switch (state) {
          case "open":
            setMapOptionsPosition('translate(0rem,0rem)');
            break;
          case "close":
            setMapOptionsPosition('translate(25rem,0rem)');
            break;
        };
        break;
    };
  };

  function BuildComponentOptions() {
    const categories = [...new Set(components.map(obj => obj.categoryName))].sort();
    return (
      <>
        <Layer>
          <Accordion size='lg'>
            {categories.map(category => (
              <AccordionItem title={category}>
                <div style={{display:'grid', gridTemplateColumns:'repeat(2,0.5fr)', padding:"0.5rem 0rem 0.5rem 0rem"}}>
                  {components.map(component => {
                    if (component.categoryName === category) return (
                      <ClickableTile
                        style={{backgroundColor:`${component.componentColor}`}} 
                        onClick={() => {
                          setShowNotification(true);
                          handlePaneView("right","close")
                          addComponentListener.current = {listening: true, componentId:component.componentId};
                        }}
                        children={
                          <>
                            <div style={{display:'flex', flexDirection:'column', alignItems:'center'}}>
                              <div><strong>{component.componentName}</strong></div>
                              <div><svg width="3rem" height="3rem" dangerouslySetInnerHTML={{__html: `${svgData.current.find(svg => svg.icon === component.componentIcon).data}`}}/></div>
                              <div><strong>{component.componentType ? `(${component.componentType})`:null}</strong></div>
                            </div>
                          </>
                        }
                      />
                    );
                  })}
                </div>
              </AccordionItem>
            ))}
          </Accordion>
        </Layer>
      </>
    );
  };

  async function searchDirectory (source, searchValue) {
    if (!searchValue) {
      if (source === "start") setStartSearchResults([]);
      if (source === "end") setDestSearchResults([]);
    }
    if (searchValue){
      const results = await venueDirectory.search(searchValue);
      const filteredResults = [];
      results.filter(r => r.type === "MappedinLocation").map(r => r.object).filter(l => l.type === "tenant")
      if (results.length > 0) {
        const size = results.length > 10 ? 10:results.length - 1;
        for (let i=0;i<=size;i++) {
          if (results[i].matches[0].weight >= 1) {
            filteredResults.push({
              "source":source,
              "name":results[i].matches[0].value,
              "polygonId":results[i].object.id
            });
          };
        };
      };
      if (results.length <= 0) {
        filteredResults.push({
          source:source,
          name:"No results",
          polygonId:0
        });
      };
      if (source === "start") setStartSearchResults(filteredResults);
      if (source === "end") setDestSearchResults(filteredResults);
    };
  };

  function getDirections() {
    if (!startLocation.polygonId || !selectedLocation.polygonId) return;
    
    let start, end;
    
    switch (startLocation.source) {
      case "location":
        if (startLocation.polygonId) start = venue.locations.find(location => location.id === startLocation.polygonId);
        if (startLocation.name && !start) start = venue.locations.find(location => location.name === startLocation.name);
        break;
      case "marker": 
        const floor = startLocation.floor ? startLocation.floor - 1:0;
        start = venue.maps[floor].createCoordinate(startLocation.lat, startLocation.long).nearestNode;
        break;
    };
    switch (selectedLocation.source) {
      case "location":
        if (selectedLocation.polygonId) end = venue.locations.find(location => location.id === selectedLocation.polygonId);
        if (selectedLocation.name && !end) end = venue.locations.find(location => location.name === selectedLocation.name);
        break;
      case "marker":
        const floor = selectedLocation.floor ? selectedLocation.floor - 1:0;
        end = venue.maps[floor].createCoordinate(selectedLocation.lat, selectedLocation.long).nearestNode;
        break;
    };
    
    if (start && end) {
      const directions = start.directionsTo(end);
      let instructions = [];
      directions.instructions.forEach(
        step => {instructions.push(
          {
            "instruction":step.instruction,
            "distanceMeters":Math.round(step.distance),
            "distanceFeet":Math.round(step.distance*3.28084)
          }
        )}
      );
      setDirectionsInstructions(instructions);
      setDisplayTbtDirections(true);
      const journey = mapView.Journey.draw(directions);
      mapView.Camera.focusOn(
        { polygons:start.polygons },
        {
          updateZoomLimits: true,
          changeZoom: true,
          rotation:0,
          tilt:0.5,
          minZoom:1500,
          duration: 1250,
          easing: CAMERA_EASING_MODE.EASE_OUT
        }
      );
      setCurrentJourney(journey);
    };
  };

  return (
    <>
      <GlobalHeader isAuth={true}/>
        {
          showNotification && (
          <div className='mapNotification'>
            <ActionableNotification
              inline
              hideCloseButton
              actionButtonLabel="Cancel"
              aria-label="cancels action"
              kind="warning"
              statusIconDescription="notification"
              subtitle="Click the map to add the component"
              title="Add Map Component"
              onActionButtonClick={() => {
                addComponentListener.current = {listening: false, componentId:-1}
                setShowNotification(false);
              }}
            />
          </div>
          )
        }
      <Loading active={contentLoading} description='Loading...'/>
      <div id='mapControls'>
        {levels && (
        <Dropdown
          style={{width:'10rem'}}
          initialSelectedItem={levels[0]}
          items={levels}
          itemToString={item => item.label ? item.label:''}
          onChange={event => {
            mapView.setMap(event.selectedItem.value)
          }}
        />
        )}
        {!levels && (<DropdownSkeleton hideLabel={true}/>)}
        <IconButton
          closeOnActivation={true}
          hasIconOnly={true}
          renderIcon={Add}
          label='Add Component'
          align='bottom'
          onClick={() => handlePaneView("right","open")}
        />
      </div>
      <Modal
        danger
        size='sm'
        modalHeading="Confirm Delete"
        open={deleteModalOpen}
        primaryButtonText='Delete'
        secondaryButtonText='Cancel'
        onRequestClose={() => setDeleteModalOpen(false)}
        onRequestSubmit={() => DeleteMapComponent()}
        children="Are you sure you want to delete this component?"
      >

      </Modal>
      <Content>
        <div>
          <div 
            className='openSideNavArrow'
            style={{transform: sideNavArrowPosition}}
            onClick={() => handlePaneView("left","open")}
          >
            <SidePanelOpenFilled size={26}/>
          </div>
          <div className='mapSidenav' style={{transform: sideNavPosition}}>
              <div style={{display:'flex', justifyContent:'end'}}>
                <Button
                  size='sm'
                  kind='ghost'
                  closeOnActivation={true}
                  renderIcon={SidePanelCloseFilled}
                  label='Close'
                  align='top'
                  onClick={() => handlePaneView("left","close")}
                  children="Close"
                />
              </div>
              {
                showStartSearchBar && (
                  <div>
                    <Layer>
                      <ContainedList>
                        <Search 
                          id="searchStart"
                          labelText="Start"
                          renderIcon={NavaidMilitaryCivil}
                          placeholder={'Choose start location'}
                          value={startLocation.name}
                          onClear={() => {
                            setStartLocation({name:'',polygonId:''});
                            setStartSearchResults([]);
                            mapView.Journey.clear();
                          }}
                          onChange={event => {
                            setStartLocation({name:event.target.value});
                            searchDirectory("start",event.target.value);
                            if (directionsInstructions.length) {
                              setDirectionsInstructions([]);
                              setDisplayTbtDirections(false);
                            };
                          }}
                        />
                        {
                          startSearchResults.map((result, index) => (
                            <ContainedListItem
                            key={index}
                            children={result.name}
                            onClick={() => {
                              const location = venue.locations.find(location => location.id === result.polygonId);
                                const locationData = {
                                  polygonId:location.id,
                                  source:'location',
                                  type:'Room',
                                  name:location.name,
                                  color:'#78a9ff',
                                  lat:location.nodes[0].lat,
                                  long:location.nodes[0].lon,
                                  icon:location.logo ? location.logo.original:defaultLocation
                                }
                                setStartLocation(locationData);
                                setStartSearchResults([]);
                            }}
                          />
                          ))
                        }
                      </ContainedList>
                    </Layer>
                  </div>
                )
              }
              {showDestSearchBar && (
                <div>
                  <Layer>
                    <ContainedList>
                      <Search 
                        id="searchEnd"
                        placeholder='Search here'
                        renderIcon={LocationFilled}
                        value={selectedLocation.name}
                        onClear={() => {
                          mapView.Journey.clear()
                          setCurrentJourney({});
                          setShowStartSearchBar(false);
                          setStartLocation({name:'',polygonId:''});
                          setSelectedLocation({
                            polygonId:'',
                            type:'',
                            color:'',
                            name:'',
                            lat:'',
                            long:'',
                            icon:''
                          });
                          onClickListener.current = false;
                          if (directionsInstructions.length) {
                            setDirectionsInstructions([]);
                            setDisplayTbtDirections(false);
                          };
                        }}
                        onChange={event => {
                          setSelectedLocation(prevState => ({...prevState, name:event.target.value}));
                          searchDirectory("end",event.target.value);
                          if (directionsInstructions.length) {
                            setDirectionsInstructions([]);
                            setDisplayTbtDirections(false);
                          }
                        }} 
                      />
                      {
                        destSearchResults.map((result, index) => (
                          <ContainedListItem
                            key={index}
                            children={result.name}
                            onClick={() => {
                              const location = mapView.venue.locations.find(location => location.id === result.polygonId);
                              console.log(location);
                              const locationData = {
                                polygonId:location.id,
                                source:'location',
                                type:'Room',
                                name:location.name,
                                color:'#78a9ff',
                                lat:location.nodes[0].lat,
                                long:location.nodes[0].lon,
                                icon:location.logo ? location.logo.original:defaultLocation
                              }
                              location.polygons.forEach(polygon => {
                                mapView.setPolygonColor(polygon, "#BF4320")
                              }); 
                              mapView.Camera.focusOn(
                                { polygons: location.polygons },
                                {
                                  updateZoomLimits: true,
                                  changeZoom: true,
                                  rotation:0,
                                  tilt:0.5,
                                  minZoom:1500,
                                  duration: 1250,
                                  easing: CAMERA_EASING_MODE.EASE_OUT
                                }
                              );
                              
                              setSelectedLocation(locationData);
                              setShowDestSearchBar(false);
                              setShowLocationInfo(true);
                              setDestSearchResults([]);
                            }}
                          />
                        ))
                      }
                    </ContainedList>
                  </Layer>
                </div>
              )}
              
              {
                showLocationInfo && (
                  <>
                    <SideNavDivider/>
                    <Stack gap={6}>
                    <div>
                      <p><strong>{selectedLocation.name.toLocaleUpperCase()}</strong></p>
                    </div>
                      <div 
                        className='iconContainer'
                        style={{backgroundColor:`${selectedLocation.source === "marker" ? selectedLocation.color:"#D0E2FF"}`}}
                      >
                        { 
                          selectedLocation.source === "marker" ?  
                            <svg dangerouslySetInnerHTML={{__html: `${svgData.current.find(svg => svg.icon === selectedLocation.icon).data}`}}/>
                            :
                            <img className='locationIcon' src={selectedLocation.icon}/>
                        }
                      </div>
                      <div>
                        <TextInput
                          id="componentType"
                          value={selectedLocation.type}
                          readOnly={true}
                          labelText="Type"
                          inline={true}
                        />
                        <TextInput
                          id="componentLat"
                          value={selectedLocation.lat}
                          readOnly={true}
                          labelText="Latitude"
                          inline={true}
                          />
                        <TextInput
                          id="componentLong"
                          value={selectedLocation.long}
                          readOnly={true}
                          labelText="Longitude"
                          inline={true}
                          />
                      </div>
                      <div style={{maxWidth:'10rem'}}>
                        <ButtonSet>
                          <Button
                            renderIcon={CloseOutline}
                            kind="secondary"
                            onClick={() => {
                              setShowDestSearchBar(true);
                              setShowStartSearchBar(false);
                              setShowLocationInfo(false);
                              setSelectedLocation({
                                polygonId:'',
                                type:'',
                                color:'',
                                name:'',
                                lat:'',
                                long:'',
                                icon:''
                              });
                            }}
                            children="Back"
                          />
                          <Button 
                            renderIcon={Location}
                            onClick={() => {
                              onClickListener.current = true;
                              setShowLocationInfo(false);
                              setShowDestSearchBar(true);
                              setShowStartSearchBar(true);
                            }}
                            children="Directions"
                          />
                        </ButtonSet>
                        {
                          selectedLocation.source === "marker" ? 
                          <>
                          <ButtonSet style={{paddingTop:"0.25rem"}}>
                          <Button 
                            kind='danger'
                            renderIcon={TrashCan}
                            children="Delete"
                            onClick={() => {setDeleteModalOpen(true)}}
                            />
                          </ButtonSet>
                            </>:
                            null
                        }
                      </div>
                    </Stack>
                  </>
                )
              }
            {
              displayTbtDirections && (
                <div className='tbtDirections'>
                  <Divider orientation='center'>Directions to {selectedLocation.name}</Divider>
                  <List
                    bordered={false}
                    dataSource={directionsInstructions}
                    renderItem={step => (
                      <List.Item>
                        <div>
                          <p className='stepDistance'>
                            {step.distanceFeet} {step.distanceFeet === 1 ? "foot":"feet"} ({step.distanceMeters} meters)
                          </p>
                          <p className='stepInstruction'>{step.instruction}</p>
                        </div>
                      </List.Item>
                    )}
                  />
                </div>
              )
            }
          </div>
          <div className='rightPane' style={{transform: mapOptionsPosition}}>
            <div style={{display:'flex',gap:'2rem'}}>
              <div>
              <Button
                  size='sm'
                  kind='ghost'
                  closeOnActivation={true}
                  renderIcon={RightPanelCloseFilled}
                  label='Close'
                  align='top'
                  onClick={() => handlePaneView("right","close")}
                  children="Close"
                />
              </div>
            </div>
            <div id="mapOptionsAddComponent">
              <Layer>
                <ContainedList label="Add Map Component"/>
                <BuildComponentOptions/>
              </Layer>
            </div>
          </div>
        </div>
        <div id="mapView" ref={mapRef} />
      </Content>
    </>
  );
}
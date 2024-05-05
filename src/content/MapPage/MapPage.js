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
  List,
  Tooltip
} from 'antd';
import {
  CloseOutlined
} from '@ant-design/icons';
import { 
  Button,
  ButtonSet,
  Content,
  Dropdown,
  DropdownSkeleton,
  IconButton,
  Loading,
  Search,
  SideNavDivider,
  Stack,
  TextInput,
  Toggle
} from '@carbon/react';
import {
  CloseOutline,
  Location,
  LocationFilled,
  NavaidMilitaryCivil,
  SearchLocate,
  SettingsAdjust,
  SidePanelCloseFilled,
  SidePanelOpenFilled
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
  
  const [venue, setVenue] = useState();
  const [mapView, setMapView] = useState();
  const [levels, setLevels] = useState();
  const [sideNavPosition, setSideNavPosition] = useState('translate(0rem,0rem)');
  const [sideNavArrowPosition, setSideNavArrowPosition] = useState('');
  const [mapOptionsPosition, setMapOptionsPosition] = useState('translate(25rem,0rem)');
  const [contentLoading, setContentLoading] = useState(false);
  const [venueDirectory, setVenueDirectory] = useState();
  const [showDestSearchBar, setShowDestSearchBar] = useState(true);
  const [showStartSearchBar, setShowStartSearchBar] = useState(false);
  const [showLocationInfo, setShowLocationInfo] = useState(false);
  const [searchResults, setSearchResults] = useState([{source:'',name:'',id:''}]);
  const [showSearchResults, setShowSearchResults] = useState(true);
  const [startLocation, setStartLocation] = useState({name:'',polygonId:''});
  const [directionsInstructions, setDirectionsInstructions] = useState([]);
  const [displayTbtDirections, setDisplayTbtDirections] = useState('none');
  const [currentJourney, setCurrentJourney] = useState({});
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
      try {
        GetMapComponents();
        mapView.addInteractivePolygonsForAllLocations();
        mapView.labelAllLocations({flatLabels: true})
        mapView.on(E_SDK_EVENT.CLICK, event => {
          console.log(event);

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
              icon:event.polygons[0].locations[0].logo.original
            };
            if (onClickListener.current) {
              console.log('click listener');
              setStartLocation(locationData);
              return;
            };
            if (!onClickListener.current) {
                console.log('no click listener');
                setSelectedLocation(locationData);
                setShowLocationInfo(true);
                setShowDestSearchBar(false);
                handleSideNavView("open");
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
              polygonId:event.floatingLabels[0].id
            }); 
            setShowLocationInfo(true);
            setShowDestSearchBar(false);
            handleSideNavView("open");
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

  const handleSideNavView = (state) => {

    if (state === "open") {
      setSideNavPosition('translate(0rem,0rem)')
      setSideNavArrowPosition('translate(-10rem,0rem)')
    }
    if (state === "close") {
      setSideNavPosition('translate(-25rem,0rem)')
      setSideNavArrowPosition('translate(9rem,0rem)')
    }
  }

  async function GetMapComponents () {
    const query = `query{
      getMapComponents (jwt:"${jwt.current}", facilityId:${location.state.facilityId}) {
        components {
          id
          type
          color
          name
          lat
          long
          floor
          icon
        }
        svgData {
          success
          message
          data
          name
        }
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
    if (componentResponse.data.getMapComponents) {
      componentResponse.data.getMapComponents.components.forEach(component => {
        const floor = component.floor ? component.floor - 1:0;
        const coordinate = venue.maps[floor].createCoordinate(component.lat, component.long);
        const base64Data = componentResponse.data.getMapComponents.svgData.find(svg => svg.name === component.icon).data
        const svg = atob(base64Data)
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
                icon:svg
              },
            }
          }
        )

        mapComponents.current[label.id] = {...component, source:"marker"};
        if (!svgData.current.some(svg => svg.icon === component.icon)) svgData.current.push({
          icon:component.icon,
          data:svg
        });
      });
    };
    if (componentResponse.errors) {};
  };

  function handleRightPaneView(pane, state) {
    switch (pane) {
      case "options":
        switch (state) {
          case "open":
            setMapOptionsPosition('translate(0rem,0rem)');
            break;
          case "close":
            setMapOptionsPosition('translate(25rem,0rem)');
            break;
        };
        break;
      case "info":
        switch (state) {
          case "open":
            setMapOptionsPosition('translate(25rem,0rem)');
            break;
          case "close":
            break;
        };
        break;
    };
  };

  async function searchDirectory (source, searchValue) {
    if (!searchValue) {
      setSearchResults([{source:'',name:'',id:''}])
      setShowSearchResults(false)
    };
    if (searchValue){
      if(!showSearchResults) setShowSearchResults(true);
      const results = await venueDirectory.search(searchValue);
      let resultsArray = [];
      results.filter(r => r.type === "MappedinLocation").map(r => r.object).filter(l => l.type === "tenant")
      if (results.length > 0) {
        const size = results.length > 5 ? 5:results.length - 1;
        for (let i=0;i<=size;i++) {
          if (results[i].matches[0].weight >= 1) {
            resultsArray.push({
              "source":source,
              "name":results[i].matches[0].value,
              "polygonId":results[i].object.id
            });
          };
        };
      };
      if (results.length <= 0) {
        resultsArray.push({
          source:source,
          name:"No results",
          polygonId:0
        });
      };
      setSearchResults(resultsArray);
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
    
    console.log(start, end)
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
      if (showSearchResults) setShowSearchResults(false);
      setDisplayTbtDirections('block');
      const journey = mapView.Journey.draw(directions);
      setCurrentJourney(journey);
    };
  };

  function handleCheckboxChange(value) {
    const safePolygons = [
      "62042759e325474a3000002b",
      "62042759e325474a3000001d",
      "62051551e325474a30001088"
    ];
    const defensePolygons = [
      "62042759e325474a30000092",
      "62042759e325474a3000008d",
      "62042759e325474a30000018",
      "62042759e325474a3000002f",
      "62051551e325474a300010ad",
      "62051551e325474a30001087"
    ]
    if (value.length > 0) {
      value.includes("safe") ?
        safePolygons.forEach(polygon => mapView.setPolygonColor(polygon, "#03730B")):
        safePolygons.forEach(polygon => mapView.clearPolygonColor(polygon));
      (value.includes("defense")) ?
        defensePolygons.forEach(polygon => mapView.setPolygonColor(polygon, "#A10808")):
        defensePolygons.forEach(polygon => mapView.clearPolygonColor(polygon));
    };
    if (value.length === 0 ) {
      safePolygons.forEach(polygon => mapView.clearPolygonColor(polygon));
      defensePolygons.forEach(polygon => mapView.clearPolygonColor(polygon));
    }
  };

  return (
    <>
      <GlobalHeader isAuth={true}/>
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
          renderIcon={SettingsAdjust}
          label='Map Options'
          align='bottom'
          onClick={() => handleRightPaneView("options","open")}
        />
      </div>
      <Content>
        <div>
          <div 
            className='openSideNavArrow'
            style={{transform: sideNavArrowPosition}}
            onClick={() => handleSideNavView("open")}
          >
            <SidePanelOpenFilled size={26}/>
            
          </div>
          <div className='mapSidenav' style={{transform: sideNavPosition}}>
            <Stack gap={4}>
              <div style={{display:'flex', justifyContent:'end'}}>
                <Button
                  size='sm'
                  kind='ghost'
                  closeOnActivation={true}
                  renderIcon={SidePanelCloseFilled}
                  label='Close'
                  align='top'
                  onClick={() => handleSideNavView("close")}
                  children="Close"
                />
              </div>
              <SideNavDivider/>
              <div>
                <p><strong>{selectedLocation.name.toLocaleUpperCase()}</strong></p>
              </div>
              {showStartSearchBar && (
                <Search 
                  id="searchStart"
                  labelText="Start"
                  renderIcon={NavaidMilitaryCivil}
                  placeholder={'Choose start location'}
                  value={startLocation.name}
                  onClear={() => {
                    setStartLocation({name:'',polygonId:''});
                    mapView.Journey.clear();
                  }}
                  onChange={event => {
                    setStartLocation({name:event.target.value});
                    searchDirectory("start",event.target.value);
                    if (directionsInstructions.length) {
                      setDirectionsInstructions([]);
                      setDisplayTbtDirections('none');
                    };
                  }} 
                />
              )}
              {showDestSearchBar && (
                <div>  
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
                        setDisplayTbtDirections('none');
                      };
                    }}
                    onChange={event => {
                      setSelectedLocation(prevState => ({...prevState, name:event.target.value}));
                      searchDirectory("end",event.target.value)
                      if (directionsInstructions.length) {
                        setDirectionsInstructions([])
                        setDisplayTbtDirections('none')
                      }
                    }} 
                  />
                </div>
              )}
              {showLocationInfo && (
                <>
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
                          console.log("directions button clicked.")
                          setShowLocationInfo(false);
                          setShowDestSearchBar(true);
                          setShowStartSearchBar(true);
                        }}
                        children="Directions"
                        />
                    </ButtonSet>
                  </div>
                </>
              )}
            </Stack>
            {showSearchResults && (
            <div className='searchResults'>
              <List
                bordered={false}
                dataSource={searchResults}
                renderItem={(item, index) => (
                  <List.Item
                    key={index}
                    className="listItem"
                    onClick={() => {
                      const location = venue.locations.find(location => location.id === item.polygonId);
                        const locationData = {
                          polygonId:location.id,
                          source:'location',
                          type:'Room',
                          name:location.name,
                          color:'#78a9ff',
                          lat:location.nodes[0].lat,
                          long:location.nodes[0].lon,
                          icon:location.logo?.original
                        }
                      if (item.source === "start") setStartLocation(locationData);
                      if (item.source === "end") {
                        setSelectedLocation(locationData);
                        setShowDestSearchBar(false);
                        setShowLocationInfo(true);
                      };
                      setShowSearchResults(false);
                      setSearchResults('');
                    }}
                  >
                    {item.name}
                  </List.Item>
                )}
              />
            </div>
            )}
            <div className='tbtDirections' style={{display:displayTbtDirections}}>
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
          </div>
          <div className='rightPane' style={{transform: mapOptionsPosition}}>
            <div style={{display:'flex',gap:'2rem'}}>
              <div>
                <CloseOutlined id="closeMapOptionsButton" onClick={() => handleRightPaneView("options","close")}/>
              </div>
              <div>
                <p><strong>Map Options</strong></p>
              </div>
            </div>
            <div style={{paddingBottom:'1rem'}}>
              <Checkbox.Group onChange={event => handleCheckboxChange(event)}>
                <div style={{display:'grid',marginLeft:'1rem'}}>
                  <div>
                    <Checkbox value="safe">Safe Room Locations</Checkbox>
                  </div>
                  <div>
                    <Checkbox value="defense">ERVA Defense</Checkbox>
                  </div>
                </div>
              </Checkbox.Group>
            </div>
            <div>
              <Toggle
                id="stackedMapsToggle"
                labelText='Stacked Maps'
                onToggle={toggled => {
                  toggled ? 
                    mapView.StackedMaps.enable({
                      verticalDistanceBetweenMaps: 125
                    })
                  :
                    mapView.StackedMaps.disable();
                }}
              />
            </div>
          </div>
        </div>
        <div id="mapView" ref={mapRef} />
      </Content>
    </>
  );
}
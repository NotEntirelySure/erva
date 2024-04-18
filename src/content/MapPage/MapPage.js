import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  createCoordinate, 
  getVenue,
  showVenue,
  E_SDK_EVENT,
  OfflineSearch,
  MappedinLocation,
  TGetVenueOptions,
} from "@mappedin/mappedin-js";
import "@mappedin/mappedin-js/lib/mappedin.css";
import {
  Checkbox,
  Divider,
  Input,
  List,
  Select,
  Spin,
  Tooltip
} from 'antd';
import {
  CloseOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { 
  Button,
  Content,
  Dropdown,
  DropdownSkeleton,
  IconButton,
  SideNavDivider,
  Stack,
  TextInput
} from '@carbon/react';
import { 
  SearchLocate,
  SettingsAdjust,
  SidePanelOpenFilled
} from '@carbon/react/icons';
import GlobalHeader from '../../components/GlobalHeader/GlobalHeader';

export default function MapPage() {

  const { Search } = Input;
  const location = useLocation();
  const mapRef = useRef(null);
  const mapComponents = useRef({});
  const svgData = useRef([{icon:'',data:''}]);
  const infoIcon = useRef();
  const jwt = useRef(sessionStorage.getItem('ervaJwt'));
  
  const [venue, setVenue] = useState();
  const [mapView, setMapView] = useState();
  const [levels, setLevels] = useState();
  const [sideNavPosition, setSideNavPosition] = useState('translate(0rem,0rem)');
  const [sideNavArrowPosition, setSideNavArrowPosition] = useState('');
  const [mapOptionsPosition, setMapOptionsPosition] = useState('translate(25rem,0rem)');
  const [markerInfoPosition, setMarkerInfoPosition] = useState('translate(25rem,0rem)');
  const [contentLoading, setContentLoading] = useState(false);
  const [venueDirectory, setVenueDirectory] = useState();
  const [searchResults, setSearchResults] = useState([{source:'',name:'',id:''}]);
  const [displaySearch, setDisplaySearch] = useState('none');
  const [directionsStart, setDirectionsStart] = useState('');
  const [directionsEnd, setDirectionsEnd] = useState('');
  const [directionsInstructions, setDirectionsInstructions] = useState([]);
  const [displayTbtDirections, setDisplayTbtDirections] = useState('none');
  const [selectedMarker, setSelectedMarker] = useState({
    type:'',
    color:'',
    name:'',
    lat:'',
    long:'',
    icon:''
  });

  const options = {
    venue: "mappedin-demo-mall", //location.state.faciilityCode
    clientId: "5eab30aa91b055001a68e996",
    clientSecret: "RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1" //location.state.apiKey // I may want to get the API key at the time of load instead of passing the value using location.state.
  };

  useEffect(() => {loadMap();},[]);

  useEffect(() => {
    if (mapView) {
      try {
        mapView.addInteractivePolygonsForAllLocations();
        mapView.labelAllLocations({flatLabels: true})
        mapView.on(E_SDK_EVENT.POLYGON_CLICKED, polygon => {mapView.setPolygonColor(polygon, "#BF4320");});
        mapView.on(E_SDK_EVENT.NOTHING_CLICKED, () => mapView.clearAllPolygonColors())
        mapView.on(E_SDK_EVENT.CLICK, ({ floatingLabels }) => {
          setSelectedMarker(mapComponents.current[floatingLabels[0].id]);
          handleRightPaneView("info","open");
        });
        GetMapComponents();
      }
      catch (error) {console.log(error)}
    };
  },[mapView]);

  useEffect(() => {
    infoIcon.current.innerHTML = svgData.current.find(svg => svg.icon === selectedMarker.icon).data;
  },[selectedMarker]);

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
    }
    // Do nothing if the mapView is already rendered with the current venue data
    if (mapView != null && mapView.venue.venue.id === venue.venue.id) {
      setContentLoading(false);
      return;
    }
    // If the mapView has been rendered with old data, destroy it
    if (mapView != null) mapView.destroy();
    // Try to render the mapView
    try {
      const _mapView = await showVenue(mapRef.current, venueData);
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
        const coordinate = mapView.currentMap.createCoordinate(component.lat, component.long);
        const base64Data = componentResponse.data.getMapComponents.svgData.find(svg => svg.name === component.icon).data
        const svg = atob(base64Data);
        const label = mapView.FloatingLabels.add(coordinate, component.name, {
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
        });
        mapComponents.current[label.id] = component;
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
            setMarkerInfoPosition('translate(25rem,0rem)');
            break;
          case "close":
            setMapOptionsPosition('translate(25rem,0rem)');
            break;
        };
        break;
      case "info":
        switch (state) {
          case "open":
            setMarkerInfoPosition('translate(0rem,0rem)');
            setMapOptionsPosition('translate(25rem,0rem)');
            break;
          case "close":
            setMarkerInfoPosition('translate(25rem,0rem)');
            break;
        };
        break;
    };
  };

  const searchDirectory = async(source, searchValue) => {
    if (searchValue === "") {
      setSearchResults([{source:'',name:'',id:''}])
      setDisplaySearch('none')
    }
    if (searchValue !== ""){
      if(displaySearch !== 'block') setDisplaySearch('block');
      const results = await venueDirectory.search(searchValue);
      let resultsArray = [];
      results.filter(r => r.type === "MappedinLocation").map(r => r.object).filter(l => l.type === "tenant")
      if (results.length > 0) {
        const size = results.length > 5 ? 5:results.length - 1;
        for (let i=0;i<=size;i++) {
          console.log(results[i]);
          if (results[i].matches[0].weight >= 1) {
            resultsArray.push({
              "source":source,
              "name":results[i].matches[0].value,
              "id":results[i].object.id
            });
          };
        };
      };
      if (results.length <= 0) {
        resultsArray.push({
          "source":source,
          "name":"No results",
          "id":0
        });
      };
      setSearchResults(resultsArray);
    };
  };

  const getDirections = () => {

    if (directionsStart !== "" && directionsEnd !== "") {

      const startLocation = venue.locations.find((location) => location.name === directionsStart);

      const endLocation = venue.locations.find((location) => location.name === directionsEnd);

      const directions = startLocation.directionsTo(endLocation);
      let instructionsArray = [];
      directions.instructions.forEach(
        step => {instructionsArray.push(
          {
            "instruction":step.instruction,
            "distanceMeters":Math.round(step.distance),
            "distanceFeet":Math.round(step.distance*3.28084)
          }
        )}
      )
      setDirectionsInstructions(instructionsArray);
      if (displaySearch === 'block') setDisplaySearch('none');
      setDisplayTbtDirections('block')
      mapView.Journey.draw(directions);
    }
  }

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
          {contentLoading && (
            <div className='overlay' style={{display:contentLoading}}>
              <div className='loadingIcon'>
                <Spin tip="Loading..."/>
              </div>
            </div>
          )}
          <div 
            className='openSideNavArrow'
            style={{transform: sideNavArrowPosition}}
            onClick={() => handleSideNavView("open")}
          >
            <Tooltip title="Show Navigation" placement="topLeft">
              <SearchLocate size={24}/>
            </Tooltip>
          </div>
          <div className='mapSidenav' style={{transform: sideNavPosition}}>
            <div style={{float:'right'}}>
              <Tooltip title="Hide Navigation">
                <CloseOutlined id="closeSideNavButton" onClick={() => handleSideNavView("close")}/>
              </Tooltip>
            </div>
            <div>
              <div style={{paddingBottom:'1rem'}}>  
                <Search 
                  id="searchStart"
                  placeholder={`Search ${location.state.map}`}
                  onSearch={() => {}}
                  enterButton
                  value={directionsStart}
                  onChange={(event) => {
                    setDirectionsStart(event.target.value)
                    searchDirectory("start",event.target.value)
                    if (directionsInstructions.length) {
                      setDirectionsInstructions([])
                      setDisplayTbtDirections('none')
                    }
                  }} 
                />
              </div>
            </div>
            <div style={{paddingBottom:'1rem'}}>
              <Search 
                id="searchEnd"
                placeholder='Search Destination'
                onSearch={() => {}}
                enterButton
                value={directionsEnd}
                onChange={event => {
                  setDirectionsEnd(event.target.value)
                  searchDirectory("end",event.target.value)
                  if (directionsInstructions.length) {
                    setDirectionsInstructions([])
                    setDisplayTbtDirections('none')
                  }
                }
                } 
              />
            </div>
            <div style={{paddingBottom:'1rem'}}>
              <Button type="primary" onClick={() => getDirections()}>Get Directions <EnvironmentOutlined /></Button>  
            </div> 
            <div className='searchResults' style={{display:displaySearch}}>
            <List
              bordered={false}
              dataSource={searchResults}
              renderItem={(item) => (
                <List.Item 
                  className="listItem"
                  onClick={() => {
                    if (item.source === "start") setDirectionsStart(item.name)
                    if (item.source === "end") setDirectionsEnd(item.name)
                    setDisplaySearch('none')
                    setSearchResults('') 
                  }}
                >
                  {item.name}
                </List.Item>
              )}
            />
            </div>
            <div className='tbtDirections' style={{display:displayTbtDirections}}>
              <Divider orientation='center'>Directions to {directionsEnd}</Divider>
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
                <Tooltip title="Hide Map Options">
                  <CloseOutlined id="closeMapOptionsButton" onClick={() => handleRightPaneView("options","close")}/>
                </Tooltip>
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
          </div>
        </div>
        <div className='rightPane' style={{transform:markerInfoPosition}}>
          <Button
            size='sm'
            kind='ghost'
            closeOnActivation={true}
            renderIcon={SidePanelOpenFilled}
            label='Close'
            align='top'
            onClick={() => handleRightPaneView("info","close")}
            children="Close"
          />
          <Stack gap={5}>
            <div>
              <p><strong>{selectedMarker.name.toLocaleUpperCase()}</strong></p>
            </div>
            <div style={{display:'flex', justifyContent:'center'}}>
              <div className='infoIcon' style={{backgroundColor:selectedMarker.color}}>
                <svg style={{height:'5rem'}} ref={infoIcon}/>
              </div>
            </div>
            <SideNavDivider/>
            <div>
              <TextInput
                id="componentType"
                value={selectedMarker.type}
                readOnly={true}
                labelText="Type"
                inline={true}
              />
              <TextInput
                id="componentLat"
                value={selectedMarker.lat}
                readOnly={true}
                labelText="Latitude"
                inline={true}
              />
              <TextInput
                id="componentLong"
                value={selectedMarker.long}
                readOnly={true}
                labelText="Longitude"
                inline={true}
              />
            </div>
          </Stack>
        </div>
        <div id="mapView" ref={mapRef} />
      </Content>
    </>
  );
}
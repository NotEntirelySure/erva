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
  Button,
  Checkbox,
  Divider,
  Input,
  List,
  Select,
  Spin,
  Tooltip
} from 'antd';
import {
  ArrowRightOutlined,
  CloseOutlined,
  EnvironmentOutlined,
  ProfileOutlined
} from '@ant-design/icons';
import { Content } from '@carbon/react';
import { SearchLocate, SettingsAdjust } from '@carbon/react/icons';
import GlobalHeader from '../../components/GlobalHeader/GlobalHeader';

export default function MapPage() {

  const { Search } = Input;
  const location = useLocation();
  const mapRef = useRef(null);
  const jwt = useRef(sessionStorage.getItem('ervaJwt'));
  
  const [authStatus, setAuthStatus] = useState({});
  const [venue, setVenue] = useState();
  const [mapView, setMapView] = useState();
  const [levels, setLevels] = useState([]);
  const [sideNavPosition, setSideNavPosition] = useState('translate(0rem,0rem)');
  const [sideNavArrowPosition, setSideNavArrowPosition] = useState('');
  const [mapOptionsPosition, setMapOptionsPosition] = useState('');
  const [mapOptionsArrowPosition, setMapOptionsArrowPosition] = useState('');
  const [contentLoading, setContentLoading] = useState(false);
  const [venueDirectory, setVenueDirectory] = useState();
  const [searchResults, setSearchResults] = useState([{source:'',name:'',id:''}]);
  const [displaySearch, setDisplaySearch] = useState('none');
  const [directionsStart, setDirectionsStart] = useState('');
  const [directionsEnd, setDirectionsEnd] = useState('');
  const [directionsInstructions, setDirectionsInstructions] = useState([]);
  const [displayTbtDirections, setDisplayTbtDirections] = useState('none');

  const options = {
    venue: "mappedin-demo-mall", //location.state.faciilityCode
    clientId: "5eab30aa91b055001a68e996",
    clientSecret: "RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1" //location.state.apiKey // I may want to get the API key at the time of load instead of passing the value using location.state.
  };

  useEffect(() => {
    console.log(location.state);
    loadMap();
  },[]);

  useEffect(() => {
    if (mapView) {
      try {
        GetMapComponents();
        mapView.addInteractivePolygonsForAllLocations();
        mapView.labelAllLocations({flatLabels: true})
        mapView.on(E_SDK_EVENT.POLYGON_CLICKED, polygon => {console.log(polygon);mapView.setPolygonColor(polygon, "#BF4320")});
        mapView.on(E_SDK_EVENT.NOTHING_CLICKED, () => mapView.clearAllPolygonColors())
      }
      catch (error) {console.log(error)}
    };
  },[mapView]);

  const loadMap = async() => {
    setContentLoading(true);
    const venueData = await getVenue(options);
    // Update state variable after data is fetched
    setVenue(venueData);
    let levelsArray = [];
    venueData.maps.sort(
      (a, b) => a.elevation - b.elevation).forEach((level) => {
        levelsArray.push({"value":level.id, "label":level.name,"shortName":level.shortName})
      }
    )
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
      const svg = `<?xml version="1.0" ?><!DOCTYPE svg  PUBLIC '-//W3C//DTD SVG 1.1//EN'  'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'><svg enable-background="new 0 0 48 48" height="48px" version="1.1" viewBox="0 0 48 48" width="48px" xml:space="preserve" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Layer_5"><path d="M32.246,1.268c-1.676,0-3.109,0.999-3.764,2.43h-3.187c-0.599-1.771-2.257-3.052-4.228-3.052   c-1.201,0-2.285,0.478-3.089,1.245H6.805v3.519h6.441c-3.146,1.982-5.744,4.755-7.489,8.059l3.677,1.5   c1.791-3.217,4.593-5.774,7.963-7.302c0.468,0.685,1.119,1.229,1.886,1.565v1.419c-4.059,0.796-7.123,4.37-7.123,8.661v28.667   h17.655V19.312c0-4.243-2.992-7.784-6.983-8.631V9.241c0.968-0.423,1.759-1.176,2.232-2.119h3.417   c0.654,1.429,2.088,2.429,3.764,2.429l9.996,0.933V0.022L32.246,1.268z M21.004,7.095c-1.134,0-2.055-0.92-2.055-2.055   c0-1.135,0.92-2.054,2.055-2.054c1.135,0,2.055,0.919,2.055,2.054C23.059,6.175,22.139,7.095,21.004,7.095z" fill="#241F20"/></g></svg>`
      
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
        id
        type
        name
        icon
        lat
        long
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
    if (componentResponse.data.getMapComponents.success) {

    };
    if (componentResponse.errors) {

    };
  };

  const handleMapOptionsView = (state) => {

    if (state === "open") {
      setMapOptionsPosition('translate(0rem,0rem)');
      setMapOptionsArrowPosition('translate(10rem,0rem)');
    };
    if (state === "close") {
      setMapOptionsPosition('translate(25rem,0rem)');
      setMapOptionsArrowPosition('translate(-9rem,0rem)');
    };
  }

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
        <div 
          className='openOptionsArrow'
          style={{transform: mapOptionsArrowPosition, display:'flex',alignItems:'center'}}
          onClick={() => handleMapOptionsView("open")}
        >
          <Tooltip title="Show Map Options" placement="topRight">
            <SettingsAdjust size={24}/>
          </Tooltip>
        </div>
        <div className='mapOptions' style={{transform: mapOptionsPosition}}>
          <div style={{display:'flex',gap:'2rem'}}>
            <div>
              <Tooltip title="Hide Map Options">
                <CloseOutlined id="closeMapOptionsButton" onClick={() => handleMapOptionsView("close")}/>
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
        <div id="mapView" ref={mapRef} />
      </Content>
        <div id='floorSelector'>
            <Select
              defaultValue={"Select Floor"}
              style={{width:'10rem'}}
              onChange={selection => mapView.setMap(selection)}
              options={levels}
            />
          </div>
    </>
  );
}
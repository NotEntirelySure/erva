import React, {
  useState, 
  useEffect,
  useRef,
  useCallback
} from 'react';
import { 
  getVenue,
  showVenue,
  E_SDK_EVENT,
  OfflineSearch,
  MappedinLocation,
  TGetVenueOptions 
} from "@mappedin/mappedin-js";
import "@mappedin/mappedin-js/lib/mappedin.css";
import {
  Button,
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
  RollbackOutlined
} from '@ant-design/icons';
import { useLocation } from 'react-router-dom';
import GlobalHeader from '../../components/GlobalHeader';

export default function MapPage() {

  const { Search } = Input;
  const location = useLocation();
  const mapRef = useRef(null);
  const [venue, setVenue] = useState();
  const [mapView, setMapView] = useState();
  const [levels, setLevels] = useState([]);
  const [sideNavPosition, setSideNavPosition] = useState('')
  const [sideNavArrowPosition, setSideNavArrowPosition] = useState('')
  const [contentLoading, setContentLoading] = useState('none')
  const [venueDirectory, setVenueDirectory] = useState();
  const [searchResults, setSearchResults] = useState([{source:'',name:'',id:''}]);
  const [displaySearch, setDisplaySearch] = useState('none');
  const [directionsStart, setDirectionsStart] = useState('');
  const [directionsEnd, setDirectionsEnd] = useState('');
  const [directionsInstructions, setDirectionsInstructions] = useState([]);
  const [displayTbtDirections, setDisplayTbtDirections] = useState('none');

  const options = {
    venue:location.state.map,
    clientId:"5eab30aa91b055001a68e996",
    clientSecret:location.state.apiKey,
  };
  
  useEffect(() => {
    const loadMap = async() => {
      setContentLoading('block');
      const venueData = await getVenue(options);
      // Update state variable after data is fetched
      setVenue(venueData);
      let levelsArray = [];
      venueData.maps.sort(
        (a, b) => a.elevation - b.elevation).forEach((level) => {
          levelsArray.push({"value":level.id, "label":level.name,"shortName":level.shortName})
        }
      )
      console.log(levelsArray);
      setLevels(levelsArray);
      
      const directory = new OfflineSearch(venueData)
      setVenueDirectory(directory);
      // Do nothing if the  map container or venue data are not initialized
      if (mapRef.current === null || venueData === null) return;
      // Do nothing if the mapView is already rendered with the current venue data
      if (mapView != null && mapView.venue.venue.id === venue.venue.id) return;
      // If the mapView has been rendered with old data, destroy it
      if (mapView != null) mapView.destroy();
      // Try to render the mapView
      try {
        const _mapView = await showVenue(mapRef.current, venueData, options);
        setMapView(_mapView);
      }
      catch (error) {
        // Handle error
        console.log(error);
        setMapView(undefined);
      }
      setContentLoading('none');
    }
    loadMap();
  },[])

  useEffect(() => {
    if (mapView !== undefined) {
      try {
        mapView.addInteractivePolygonsForAllLocations();
        mapView.labelAllLocations({flatLabels: true})
        mapView.on(E_SDK_EVENT.POLYGON_CLICKED, polygon => {console.log(polygon);mapView.setPolygonColor(polygon, "#BF4320")});
        mapView.on(E_SDK_EVENT.NOTHING_CLICKED, () => mapView.clearAllPolygonColors())
      }
      catch (error) {console.log(error)}
    }
  },[mapView])

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

  const searchDirectory = async(source, searchValue) => {
    if (searchValue === "") {
      setSearchResults([{source:'',name:'',id:''}])
      setDisplaySearch('none')
    }
    if (searchValue !== ""){
      if(displaySearch !== 'block') setDisplaySearch('block');
      const results = await venueDirectory.search(searchValue);
      let resultsArray = [];
      results
      .filter((r) => r.type === "MappedinLocation")
      .map((r) => r.object)
      .filter((l) => l.type === "tenant")
      for (let i=0;i<=5;i++){
        console.log(results[i]);
        resultsArray.push({
          "source":source,
          "name":results[i].matches[0].value,
          "id":results[i].object.id
        })
      }
      setSearchResults(resultsArray);
    }
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

  return (
    <>
      <GlobalHeader/>
      <div>
      <div className='overlay' style={{display:contentLoading}}>
          <div className='loadingIcon'>
            <Spin tip="Loading"/>
          </div>
        </div>
        <div className='openSideNavArrow' style={{transform: sideNavArrowPosition}}>
          <Tooltip title="Show Navigation" placement="topLeft">
            <ArrowRightOutlined onClick={() => handleSideNavView("open")}/>
          </Tooltip>
        </div>
        <div className='mapSidenav' style={{transform: sideNavPosition}}>
          <div style={{float:'right'}}>
            <Tooltip title="Hide Navigation">
              <CloseOutlined onClick={() => handleSideNavView("close")}/>
            </Tooltip>
          </div>
          <div>
            <Select
              defaultValue={"Select Floor"}
              style={{width:'10rem'}}
              onChange={selection => mapView.setMap(selection)}
              options={levels}
            />
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
          <div>
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
          <div>
            <Button type="primary"><RollbackOutlined onClick={() => getDirections()}/></Button>  
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
                      {step.distanceFeet} {step.distanceFeet === 1 ? "foot":"feet"} ({step.distanceMeters} meters) </p>
                    <p className='stepInstruction'>{step.instruction}</p>
                  </div>
                </List.Item>
              )}
            />
          </div>
        </div>
      </div>
      <div id="mapView" ref={mapRef} />
    </>
  );
}


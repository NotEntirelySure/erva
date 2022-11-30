import React, {useState, useEffect, useRef, useCallback} from 'react';
import { getVenue, showVenue, E_SDK_EVENT, TGetVenueOptions } from "@mappedin/mappedin-js";
import { useLocation } from 'react-router-dom';
import "@mappedin/mappedin-js/lib/mappedin.css";
import GlobalHeader from '../../components/GlobalHeader';
import { ExceptionMap } from 'antd/lib/result';

export default function App() {

  const mapRef = useRef(null);
  const location = useLocation();
  const options = {
    venue: location.state.map,
    clientId: "5eab30aa91b055001a68e996",
    clientSecret: "RJyRXKcryCMy4erZqqCbuB1NbR66QTGNXVE0x3Pg6oCIlUR1",
  };
  
  const useVenue = (TGetVenueOptions) => {
    // Store the venue object in a state variable
    const [venue, setVenue] = useState();
  
    // Fetch data asynchronously whenever options are changed
    useEffect(() => {
      let ignore = false;
      const fetchData = async () => {
        try {
          const data = await getVenue(options);
          // Update state variable after data is fetched
          if (!ignore) setVenue(data);
        } 
        catch (error) {
          console.log(error);
          setVenue(undefined);
        }
      };
      fetchData();
  
      return () => ignore = true;
    }, []);
  
    // Return the venue object
    return venue;
  }

  const useMapView = (el,venue,options) => {
    // Store the MapView instance in a state variable
    const [mapView, setMapView] = useState();
  
    // Render the MapView asynchronously
    useEffect(() => {
      const renderVenue = async () => {
        // Do nothing if the  map container or venue data are not initialized
        if (el === null || venue === null) return;
        // Do nothing if the mapView is already rendered with the current venue data
        if (mapView != null && mapView.venue.venue.id === venue.venue.id) return;
        // If the mapView has been rendered with old data, destroy it
        if (mapView != null) mapView.destroy();
        // Try to render the mapView
        try {
          const _mapView = await showVenue(el, venue, options);
          setMapView(_mapView);
        }
        catch (error) {
          // Handle error
          console.log(error);
          setMapView(undefined);
        }
      };
      renderVenue();
    }, [el, venue, options, mapView]);
  
    // Return the MapView instance
    return mapView;
  }

  const venue = useVenue(options);
  const mapView = useMapView(mapRef.current, venue);

  useEffect(() => {
    if (mapView !== undefined && venue !== undefined) {
      try {
        mapView.addInteractivePolygonsForAllLocations();
        mapView.labelAllLocations({flatLabels: true})
        mapView.on(E_SDK_EVENT.POLYGON_CLICKED, polygon => mapView.setPolygonColor(polygon, "#BF4320"));
        mapView.on(E_SDK_EVENT.NOTHING_CLICKED, polygon => mapView.clearAllPolygonColors())
      }
      catch (error) {console.log(error)}
    }
  },[mapView])
  
  return (
    <>
      <GlobalHeader/>
      <div>{location.state.map}</div>
      <div id="mapView" ref={mapRef} />
    </>
  );
}


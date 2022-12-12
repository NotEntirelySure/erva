import React, {useState, useEffect } from 'react';
import { showVenue, E_SDK_EVENT } from '@mappedin/mappedin-js';

export default function useMapView(el,venue,options) {
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
        _mapView.addInteractivePolygonsForAllLocations();
        _mapView.labelAllLocations({flatLabels: true})
        _mapView.on(E_SDK_EVENT.POLYGON_CLICKED, polygon => _mapView.setPolygonColor(polygon, "#BF4320"));
        _mapView.on(E_SDK_EVENT.NOTHING_CLICKED, () => _mapView.clearAllPolygonColors());
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
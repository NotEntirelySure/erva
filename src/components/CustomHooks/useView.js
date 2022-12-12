import { useState, useEffect } from 'react';
import { getVenue } from '@mappedin/mappedin-js';

export default function useVenue(TGetVenueOptions) {
  // Store the venue object in a state variable
  const [venue, setVenue] = useState();

  // Fetch data asynchronously whenever options are changed
  useEffect(() => {
    let ignore = false;
    const fetchData = async () => {
      try {
        const data = await getVenue(TGetVenueOptions);
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
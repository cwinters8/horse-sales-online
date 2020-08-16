import React, {useState, useEffect} from 'react';
import {Label, Button} from 'reactstrap';
import Select from 'react-select';

// firebase
import {firebaseApiKey} from '../Firebase';

const Location = props => {
  // STATE
  const [places, setPlaces] = useState([]);
  const [location, setLocation] = useState({});

  // HOOKS
  useEffect(() => {
    if (places.length) {
      setLocationState(places[0]);
    }
  // eslint-disable-next-line
  }, [places]);

  // FUNCTIONS
  const setLocationState = place => {
    setLocation(place);
    props.setLocation(place);
  }
  const getLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.watchPosition(position => {
        const coordinates = position.coords;
        const geocodeAPI = "https://maps.googleapis.com/maps/api/geocode/json";
        console.log('running fetch...');
        fetch(`${geocodeAPI}?latlng=${coordinates.latitude},${coordinates.longitude}&key=${firebaseApiKey}`).then(res => {
          return res.json();
        }).then(response => {
          const results = response.results;
          console.log('response.results:', results);
          if (results.length > 0) {
            const placeOptions = [];
            results.forEach(result => {
              const splitAddress = result.formatted_address.split(', ');
              if (splitAddress.length < 4) {
                placeOptions.push({
                  label: result.formatted_address,
                  value: result.place_id
                });
              }
            });
            placeOptions.push({
              label: 'Other',
              value: 'other'
            });
            setPlaces(placeOptions);
          }
        });
      });
    }
  }

  // DOM
  return (
    <div>
      <Label>Location</Label>
      <Button onClick={getLocation} color="primary" className="location-button">Get current location</Button>
      <Select className="horse-form-select horse-form-input places" options={places} value={location} onChange={setLocationState} />
    </div>
  );
}

export default Location;
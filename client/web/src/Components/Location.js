import React, {useState, useEffect} from 'react';
import {Label, Button, Spinner} from 'reactstrap';
import Select from 'react-select';
import GooglePlacesAutocomplete, {geocodeByPlaceId} from 'react-google-places-autocomplete';

// firebase
import {firebaseApiKey} from '../Firebase';

// images
import poweredByGoogle from '../images/powered_by_google_on_non_white.png';

// API URL for Google Maps Geocoding
const geocodeAPI = "https://maps.googleapis.com/maps/api/geocode/json";

const Location = props => {
  // STATE
  const [places, setPlaces] = useState([]);
  const [pendingGetLocation, setPendingGetLocation] = useState(false);
  const [abortFetch, setAbortFetch] = useState(false);
  const [navHandlerId, setNavHandlerId] = useState(null);

  // FUNCTIONS
  const setLocationState = data => {
    const placeId = data.place_id || data.id;
    geocodeByPlaceId(placeId).then(results => {
      results.forEach(result => {
        const location = result.geometry.location;
        const latLng = {
          lat: location.lat(),
          lng: location.lng()
        }
        props.setLocation({
          value: {
            latLng,
            placeId,
            placeTypes: result.types
          },
          label: data.description
        });
      });
    });
  }

  const controller = new window.AbortController();
  const signal = controller.signal;
  signal.addEventListener('abort', () => {
    // set abortFetch back to false after the fetch has been aborted
    setAbortFetch(false);
  });
  const getLocation = () => {
    if ('geolocation' in navigator) {
      setPendingGetLocation(true);
      setNavHandlerId(navigator.geolocation.watchPosition(position => {
        const coordinates = position.coords;
        if (!abortFetch) {
          fetch(`${geocodeAPI}?latlng=${coordinates.latitude},${coordinates.longitude}&key=${firebaseApiKey}`, {signal: signal}).then(res => {
            return res.json();
          }).then(response => {
            // clear the location in case a user has already typed one in
            props.setLocation({});
            // parse results and return city options to user in a select component
            const results = response.results;
            if (results.length > 0) {
              const placeOptions = [];
              results.forEach((location) => {
                const splitAddress = location.formatted_address.split(', ');
                // filter out anything long enough to be a full street address. Only want to return city/state/county/country etc.
                if (splitAddress.length < 4) {
                  placeOptions.push({
                    label: location.formatted_address,
                    value: {
                      latLng: location.geometry.location,
                      placeId: location.place_id,
                      placeTypes: location.types
                    }
                  });
                }
              });
              placeOptions.push({
                label: 'Other',
                value: 'other'
              });
              setPlaces(placeOptions);
              setPendingGetLocation(false);
            }
          }).catch(err => {
            console.error(err);
            setPendingGetLocation(false);
          });
        } else {
          console.log('fetch aborted');
          setPendingGetLocation(false);
        }
      }, error => {
        console.error(error);
        setPendingGetLocation(false);
      }));
    }
  }

  const cancelGetLocation = () => {
    console.log('aborting fetch...');
    setAbortFetch(true);
    if (navHandlerId) {
      navigator.geolocation.clearWatch(navHandlerId);
    }
    controller.abort();
    setPendingGetLocation(false);
  }

  const onPlacesChange = place => {
    if (place.value === 'other') {
      setPlaces([]);
      props.setLocation({});
    } else {
      props.setLocation({
        value: place.value,
        label: place.label
      });
    }
    return place;
  }

  // CHILD COMPONENTS
  const GetLocation = () => {
    useEffect(() => {
      if (places.length > 0) {
        if (Object.keys(props.location).length === 0) {
          props.setLocation(places[0]);
        }
      }
    });

    if (pendingGetLocation) {
      return (
        <div>
          <Spinner color="primary" />
          <Button className="cancel" color="danger" onClick={cancelGetLocation}>Cancel</Button>
        </div>
      )
    } else {
      if (places.length > 0) {
        // return a select element with places
        // FIXME: location Select not clearing after form submission
        return <Select className="horse-form-select horse-form-input places" options={places} onChange={onPlacesChange} value={props.location} placeholder="Select a location" />
      } else {
        return <GooglePlacesAutocomplete inputClassName="form-control" onSelect={setLocationState} placeholder="Enter a city or zip code" autocompletionRequest={{types: ["(regions)"]}} initialValue={props.location.label || ''} />
      }
    }    
  }

  return (
    <div>
      <Label className="horse-form-label" for="location">Location</Label>
      <Button onClick={getLocation} color="primary" className="location-button">Get current location</Button>
      <div className="location">
        <GetLocation />
      </div>
      <div className="powered-by-google">
        <img src={poweredByGoogle} alt="Powered by Google" />
      </div>
    </div>
  )
}

export default Location;
import React, {useState, useEffect} from 'react';
import {Form, Input, Label, Button} from 'reactstrap';
import Select from 'react-select';
import {v4 as uuidv4} from 'uuid';
import Resizer from 'react-image-file-resizer';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import {MdLocationSearching} from 'react-icons/md';

import ImagePreview from './ImagePreview';

// for horse breed select
import breedList from '../data/horseBreeds.json';
const breeds = breedList.map((breed, index) => {
  return {
    label: breed,
    value: breed
  }
});

// API URL for Google Maps Geocoding
const geocodeAPI = "https://maps.googleapis.com/maps/api/geocode/json";

const NewHorse = props => {
  const storageRef = props.firebase.storage().ref('horse-photos/');
  const [images, setImages] = useState([]);
  const [uploadError, setUploadError] = useState(false);
  const [places, setPlaces] = useState([]);
  const [location, setLocation] = useState({});
  const [hidePlacesAutocomplete, setHidePlacesAutocomplete] = useState(false);

  useEffect(() => {
    const placesAutocomplete = document.getElementsByClassName('google-places-autocomplete')[0];
    if (hidePlacesAutocomplete) {
      placesAutocomplete.style.display = 'none';
    } else {
      placesAutocomplete.style.display = 'block';
    }
  }, [hidePlacesAutocomplete]);

  // FUNCTIONS
  const onImageChange = event => {
    const pictures = [];
    for (let i=0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      if (file['type'].split('/')[0] === 'image') {
        pictures.push(file);
      } else {
        alert('The file you attempted to upload is not an image. Please select only image files and try again.');
      }
    }
    Promise.all(pictures.map(picture => {
      return new Promise((resolve, reject) => {
        // resize image
        Resizer.imageFileResizer(
          picture,
          900,
          900,
          'JPEG',
          100,
          0,
          uri => {
            const userID = props.firebase.auth().currentUser.uid;
            const fileID = uuidv4();
            const fileName = `${fileID}.jpg`;
            const filePath = `${userID}/${fileName}`;
            // upload to firebase
            const imageRef = storageRef.child(filePath);
            const uploadTask = imageRef.put(uri);
            uploadTask.on('state_changed', snapshot => {
              // track upload progress
              // TODO: figure out how to track upload progress for each individual image
              // setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            }, error => {
              // if upload fails
              setUploadError(true);
              console.log(`Upload error: ${error}`);
              reject(error);
            }, () => {
              // if upload succeeds
              uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                resolve({
                  id: fileID,
                  path: filePath,
                  url: downloadURL
                });
              });
            });
          },
          'blob'
        );
      });
    })).then(imageData => {
      setImages([...images, ...imageData]);
    });
  }

  const removeImage = imageIndex => {
    // remove image from Firebase
    const imageRef = storageRef.child(images[imageIndex].path);
    imageRef.delete().then(() => {
      // remove image from preview
      // first make a copy of the images state to update with
      const imagesToSplice = [...images];
      imagesToSplice.splice(imageIndex, 1);
      setImages(imagesToSplice);
    }).catch(error => {
      alert('Failed to delete image - please try again.');
      console.log(error);
    });
  }

  const setLocationState = data => {
    setLocation({
      value: data.id,
      label: data.description
    });
  }

  const getLocation = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(position => {
        const coordinates = position.coords;
        fetch(`${geocodeAPI}?latlng=${coordinates.latitude},${coordinates.longitude}&key=${props.firebaseAPIKey}`).then(res => {
          return res.json();
        }).then(response => {
          // parse results and return city options to user in a select component
          const results = response.results;
          if (results.length > 0) {
            const placeOptions = [];
            results.forEach((location, index) => {
              const splitAddress = location.formatted_address.split(', ');
              // filter out anything long enough to be a full street address. Only want to return city/state/county/country etc.
              if (splitAddress.length < 4) {
                placeOptions.push({
                  label: location.formatted_address,
                  value: location.place_id
                });
              }
            });
            placeOptions.push({
              label: 'Other',
              value: 'other'
            });
            setPlaces(placeOptions);
          }
        }).catch(err => {
          console.error(err);
        });
      });
    }
  }

  const onPlacesChange = place => {
    if (place.value === 'other') {
      setPlaces([]);
      setLocation({});
    } else {
      setLocation({
        value: place.value,
        label: place.label
      });
    }
    return place;
  }

  // CHILD COMPONENTS
  const ImageError = () => {
    if (uploadError) {
      return <p className="error">Error uploading image. Please try again.</p>
    } else {
      return null;
    }
  }

  const GetLocation = () => {
    // this really ugly workaround is needed because useEffect is needed to set parent state, and useEffect cannot be called conditionally
    let setter;
    if (places.length > 0) {
      setter = true;
    } else {
      setter = false;
    }
    useEffect(() => {
      setHidePlacesAutocomplete(setter);
    }, [setter]);
    if (places.length > 0) {
      let selectedPlace;
      if (Object.keys(location).length === 0) {
        selectedPlace = places[0];
      } else {
        selectedPlace = location;
      }
      // return a select element with places
      return <Select className="horse-form-select horse-form-input places" options={places} onChange={onPlacesChange} value={selectedPlace} placeholder="Select a location" />
    } else {
      return null;
      // TODO: once conditional rendering works for the Google Places Autocomplete library, render it here instead of hiding it
    }
  }

  // TODO: persist input data across sessions in case the user refreshes the page
  return (
    <Form className="horse-form">
      <div className="horse-form-container">
        {/* Ad Title */}
        <Label className="horse-form-label" for="ad-title">Title</Label>
        <Input className="horse-form-input" id="ad-title" type="text" />

        {/* Name */}
        <Label className="horse-form-label" for="name">Horse's Name</Label>
        <Input className="horse-form-input" id="name" type="text" />

        {/* Breed */}
        <Label className="horse-form-label" for="breed">Breed</Label>
        <Select className="horse-form-select horse-form-input" options={breeds} isMulti={true} />

        {/* Photo(s) */}
        <Label className="horse-form-label" for="photos">Upload Photo(s)</Label>
      </div>
      <ImagePreview images={images} removeImage={removeImage} firebaseStorageRef={storageRef} />
      <div className="horse-form-container">
        <Input className="horse-form-input" type="file" onChange={onImageChange} multiple accept="image/*" />
        <ImageError />

        {/* Price */}
        <Label className="horse-form-label" for="price">Price</Label>
        {/* TODO: add blur listener to convert input to include dollar sign, add commas, and round to the nearest dollar */}
        <Input className="horse-form-input" id="price" type="text" />

        {/* Location */}
        <Label className="horse-form-label" for="location">Location</Label><Button onClick={getLocation} color="primary" className="location-button">Get current location</Button>
        <div className="location">
          <GooglePlacesAutocomplete onSelect={setLocationState} apiKey={props.firebaseAPIKey} placeholder="Enter a city or zip code" autocompletionRequest={{types: ["(regions)"]}} />
          <GetLocation />
        </div>

        {/* Height */}
        {/* TODO: validate height input */}
        <Label className="horse-form-label" for="height">Height</Label>
        <Input className="horse-form-input" id="height" type="number" />

        {/* Description */}
        <Label className="horse-form-label" for="desc">Description</Label>
        <Input className="horse-form-input" id="desc" type="textarea" />
      </div>
    </Form>
  )
}

export default NewHorse;
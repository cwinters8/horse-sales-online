import React, {useState, useEffect} from 'react';
import {Form, Input, Label} from 'reactstrap';
import Select from 'react-select';
import {v4 as uuidv4} from 'uuid';
import Resizer from 'react-image-file-resizer';
import countryList from 'react-select-country-list';

import ImagePreview from './ImagePreview';

// for horse breed select
import breedList from '../data/horseBreeds.json';
const breeds = breedList.map((breed, index) => {
  return {
    label: breed,
    value: breed
  }
});

// for country select
const countries = countryList().setLabel('VN', 'Vietnam').getData();

// API URL for Google Maps Geocoding
const geocodeAPI = "https://maps.googleapis.com/maps/api/geocode/json";

const NewHorse = props => {
  const storageRef = props.firebase.storage().ref('horse-photos/');
  const [images, setImages] = useState([]);
  const [uploadError, setUploadError] = useState(false);
  // location data
  const [zipCode, setZipCode] = useState(null);
  const [country, setCountry] = useState(null);
  const [states, setStates] = useState([]);
  const [state, setState] = useState(null);
  const [city, setCity] = useState(null);

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

  const zipCodeLookup = event => {
    const zip = event.target.value;
    setZipCode(zip);
    fetch(`${geocodeAPI}?address=${zip}&key=${props.firebaseAPIKey}`).then(res => {
      return res.json();
    }).then(response => {
      if (response.results[0]) {
        const addressComponents = response.results[0].address_components;
        // console.log(addressComponents);
        // populate location state
        addressComponents.forEach((component, index) => {
          if (component.types[0] === 'country') {
            setCountry(component.long_name);
          }
        });
      } else {
        setCountry(null);
        throw('Invalid zip code');
      }
    }).catch(error => {
      console.error(error);
    });
  }

  useEffect(() => {
    if (country) {
      console.log(country);
      // get a list of states
      // TODO: Next thing to figure out - use Google Places Autocomplete? Would just be a single field that would return a city, state, country, etc
    }
  }, [country]);

  const ImageError = () => {
    if (uploadError) {
      return <p className="error">Error uploading image. Please try again.</p>
    } else {
      return null;
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
        {/* TODO: add option to get current location */}
        {/* TODO: auto-populate city/state/country when zip code is entered */}
        <Label className="horse-form-label" for="zip">Zip Code</Label>
        <Input className="horse-form-input" id="zip" type="text" onBlur={zipCodeLookup} />

        <Label className="horse-form-label" for="country">Country</Label>
        <Select className="horse-form-select horse-form-input" options={countries} value={countries.find(option => option.label === country)} />

        <Label className="horse-form-label" for="city">City</Label>
        <Input className="horse-form-input" id="city" type="text" />

        <Label className="horse-form-label" for="state">State</Label>
        <Select className="horse-form-input" id="state" options={states} />        

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
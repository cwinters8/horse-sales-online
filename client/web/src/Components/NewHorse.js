import React, {useState, useEffect} from 'react';
import {Form, Input, Label, Button, Spinner} from 'reactstrap';
import Select from 'react-select';
import {v4 as uuidv4} from 'uuid';
import Resizer from 'react-image-file-resizer';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import NumberFormat from 'react-number-format';

// components
import ImagePreview from './ImagePreview';

// data
import breedList from '../data/horseBreeds.json';
import genderList from '../data/HorseGender.json';

// images
import poweredByGoogle from '../images/powered_by_google_on_non_white.png';

// for horse breed select
const breeds = breedList.map((breed, index) => {
  return {
    label: breed,
    value: breed
  }
});

// for gender select
const genders = genderList.map((gender, index) => {
  return {
    label: gender,
    value: gender
  }
});

// API URL for Google Maps Geocoding
const geocodeAPI = "https://maps.googleapis.com/maps/api/geocode/json";

const NewHorse = props => {
  const storageRef = props.firebase.storage().ref('horse-photos/');
  const db = props.firebase.firestore();

  // custom hook to persist state in local storage
  const usePersistedState = (key, defaultValue) => {
    const [state, setState] = useState(
      () => JSON.parse(localStorage.getItem(key)) || defaultValue
    );
    useEffect(() => {
      localStorage.setItem(key, JSON.stringify(state));
    }, [key, state]);
    return [state, setState];
  }

  // STATE
  const [title, setTitle] = usePersistedState('title', '');
  const [name, setName] = usePersistedState('horseName', '');
  const [breed, setBreed] = usePersistedState('breed', []);
  const [gender, setGender] = usePersistedState('gender', {});
  const [images, setImages] = usePersistedState('images', []);
  const [uploadError, setUploadError] = useState(false);
  const [price, setPrice] = usePersistedState('price', null);
  const [places, setPlaces] = useState([]);
  const [location, setLocation] = usePersistedState('location', {});
  const [hidePlacesAutocomplete, setHidePlacesAutocomplete] = useState(false);
  const [pendingGetLocation, setPendingGetLocation] = useState(false);
  const [height, setHeight] = usePersistedState('height', null);
  const [description, setDescription] = usePersistedState('description', '');
  const [writeError, setWriteError] = useState(false);
  const [abortFetch, setAbortFetch] = useState(false);
  const [navHandlerId, setNavHandlerId] = useState(null);

  // HOOKS
  useEffect(() => {
    const placesAutocomplete = document.getElementsByClassName('google-places-autocomplete')[0];
    if (hidePlacesAutocomplete) {
      placesAutocomplete.style.display = 'none';
    } else {
      placesAutocomplete.style.display = 'block';
    }
  }, [hidePlacesAutocomplete]);

  // remove continue object from localStorage if the user is already logged in
  useEffect(() => {
    if (props.firebase.auth().currentUser) {
      localStorage.removeItem('continue');
    }
  });

  // FUNCTIONS
  const clearAllPersistedState = () => {
    setTitle('');
    setName('');
    setBreed([]);
    setGender({});
    setImages([]);
    setPrice(null);
    setLocation({});
    setHeight(null);
    setDescription('');
  }

  // helper function that converts a value to null if its undefined
  const undefinedToNull = value => {
    if (value === undefined) {
      return null;
    } else {
      return value;
    }
  }

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
        const fileID = uuidv4();
        // try setting image state with a loading property
        setImages([...images, {
          id: fileID,
          loading: true
        }]);
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
            const fileName = `${fileID}.jpg`;
            const filePath = `${userID}/${fileName}`;
            // upload to firebase
            const imageRef = storageRef.child(filePath);
            const uploadTask = imageRef.put(uri);
            uploadTask.on('state_changed', snapshot => {
              // track upload progress
              // TODO: figure out how to track upload progress for each individual image
              // setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
              console.log(`Upload progress: ${(snapshot.bytesTransferred / snapshot.totalBytes) * 100}`);
            }, error => {
              // if upload fails
              setUploadError(true);
              console.error(`Upload error: ${error}`);
              reject({
                error,
                id: fileID,
                loading: false
              });
            }, () => {
              // if upload succeeds
              uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                resolve({
                  id: fileID,
                  path: filePath,
                  url: downloadURL,
                  loading: false
                });
              });
            });
          },
          'blob'
        );
      });
    })).then(imageData => {
      setImages([...images, ...imageData]);
      clearFileInput();
    }).catch(errData => {
      setImages([...images, ...errData]);
      clearFileInput();
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

  // removes bug that happened when the user goes back or forward to this page - the loaded file input would render a new image upload
  const clearFileInput = () => {
    const input = document.getElementById('photos');
    input.value = '';
  }

  const setLocationState = data => {
    setLocation({
      value: data.id,
      label: data.description
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
          fetch(`${geocodeAPI}?latlng=${coordinates.latitude},${coordinates.longitude}&key=${props.firebaseAPIKey}`, {signal: signal}).then(res => {
            return res.json();
          }).then(response => {
            // clear the location in case a user has already typed one in
            setLocation({});
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
      setLocation({});
    } else {
      setLocation({
        value: place.value,
        label: place.label
      });
    }
    return place;
  }

  const checkHeight = values => {
    const regex = /^\d?\d?\.?[0-3]?$/;
    return regex.test(values.value);
  }

  // handle form submission
  const submit = event => {
    event.preventDefault();
    const userID = props.firebase.auth().currentUser.uid;
    const docID = uuidv4();
    // manipulate data to prepare it for Firestore
    const breedData = breed.map(value => {
      return value.value;
    });
    const imageData = images.map(value => {
      return {
        id: value.id,
        url: value.url
      }
    });

    // write to Firestore
    db.collection('horses').doc(docID).set({
      userID,
      title: title === '' ? null : title,
      name: name === '' ? null : name,
      breed: breedData,
      gender: gender.value ? gender.value : null,
      images: imageData,
      price,
      location,
      height,
      description: description === '' ? null : description
    }).then(() => {
      setWriteError(false);
      clearAllPersistedState();
    }).catch(error => {
      setWriteError(true);
      console.error('Error writing document: ', error);
    });
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
    if (places.length > 0 || pendingGetLocation) {
      setter = true;
    } else {
      setter = false;
    }
    useEffect(() => {
      setHidePlacesAutocomplete(setter);
    }, [setter]);

    useEffect(() => {
      if (places.length > 0) {
        if (Object.keys(location).length === 0) {
          setLocation(places[0])
        }
      }
    });

    if (pendingGetLocation) {
      // TODO: add a cancel button to cancel getting current location
      return (
        <div>
          <Spinner color="primary" />
          <Button className="cancel" color="danger" onClick={cancelGetLocation}>Cancel</Button>
        </div>
      )
    }

    if (places.length > 0) {
      // return a select element with places
      return <Select className="horse-form-select horse-form-input places" options={places} onChange={onPlacesChange} value={location} placeholder="Select a location" />
    } else {
      return null;
      // TODO: once conditional rendering works for the Google Places Autocomplete library, render it here instead of hiding it
    }
  }

  const WriteError = () => {
    if (writeError) {
      // TODO: create a Contact Us page
      return <p className="error submit-error">Something went wrong. Please try to submit again. If you continue to have issues, please <a href="/contact">contact us</a>.</p>
    } else {
      return null;
    }
  }

  return (
    <Form className="horse-form" onSubmit={submit}>
      <div className="horse-form-container">
        {/* Ad Title */}
        <Label className="horse-form-label" for="ad-title">Title</Label>
        <Input className="horse-form-input" id="ad-title" type="text" onChange={event => setTitle(event.target.value)} value={title} />

        {/* Name */}
        <Label className="horse-form-label" for="name">Horse's Name</Label>
        <Input className="horse-form-input" id="name" type="text" onChange={event => setName(event.target.value)} value={name} />

        {/* Breed */}
        <Label className="horse-form-label" for="breed">Breed</Label>
        <Select className="horse-form-select horse-form-input" options={breeds} isMulti={true} onChange={data => setBreed(data)} value={breed} />

        {/* Gender */}
        <Label className="horse-form-label" for="gender">Gender</Label>
        <Select className="horse-form-select horse-form-input" options={genders} onChange={data => setGender(data)} value={gender} />

        {/* Photo(s) */}
        <Label className="horse-form-label">Images</Label>
      </div>
      <ImagePreview images={images} removeImage={removeImage} firebaseStorageRef={storageRef} />
      <div className="horse-form-container">
        <Input id="photos" className="horse-form-input" type="file" onChange={onImageChange} multiple accept="image/*" />
        <Label for="photos" className="btn-primary btn">Choose photo(s)</Label>
        <ImageError />
        <br />

        {/* Price */}
        <Label className="horse-form-label" for="price">Price</Label>
        <NumberFormat className="horse-form-input form-control" id="price" thousandSeparator={true} decimalScale={0} allowNegative={false} prefix="$" onValueChange={values => setPrice(undefinedToNull(values.floatValue))} value={price} />

        {/* Location */}
        {/* TODO: HIGH PRIORITY - add Google Maps attribution */}
        <Label className="horse-form-label" for="location">Location</Label><Button onClick={getLocation} color="primary" className="location-button">Get current location</Button>
        <div className="location">
          <GooglePlacesAutocomplete inputClassName="form-control" onSelect={setLocationState} apiKey={props.firebaseAPIKey} placeholder="Enter a city or zip code" autocompletionRequest={{types: ["(regions)"]}} initialValue={location.label || ''} />
          <GetLocation />
        </div>
        <div className="powered-by-google">
          <img src={poweredByGoogle} alt="Powered by Google" />
        </div>

        {/* Height */}
        <Label className="horse-form-label" for="height">Height (hh)</Label>
        <NumberFormat className="horse-form-input form-control" id="height" decimalScale={1} allowNegative={false} isAllowed={checkHeight} onValueChange={values => setHeight(undefinedToNull(values.floatValue))} value={height} />

        {/* Description */}
        <Label className="horse-form-label" for="desc">Description</Label>
        <Input className="horse-form-input" id="desc" type="textarea" onChange={event => setDescription(event.target.value)} value={description} />

        {/* TODO: Age, Registries, Color */}
        <WriteError />
        <div className="submit-wrapper">
          <Button type="submit" color="primary" className="submit">Submit</Button>
        </div>
      </div>
    </Form>
  )
}

export default NewHorse;
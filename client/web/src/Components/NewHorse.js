import React, {useState} from 'react';
import {Form, Input, Label, Progress} from 'reactstrap';
import Select from 'react-select';
import {v4 as uuidv4} from 'uuid';
import Resizer from 'react-image-file-resizer';

import ImagePreview from './ImagePreview';

import breedList from '../data/horseBreeds.json';
const breeds = breedList.map((breed, index) => {
  return {
    label: breed,
    value: breed
  }
});

const NewHorse = props => {
  const storageRef = props.firebase.storage().ref('horse-photos/');
  const [images, setImages] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(-1);
  const [uploadError, setUploadError] = useState(false);

  const onImageChange = event => {
    const pictures = [];
    for (let i=0; i < event.target.files.length; i++) {
      pictures.push(event.target.files[i])
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
            // upload to firebase
            const imageRef = storageRef.child(`${userID}/${fileName}`);
            const uploadTask = imageRef.put(uri);
            uploadTask.on('state_changed', snapshot => {
              // track upload progress
              setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            }, error => {
              // if upload fails
              setUploadError(true);
              console.log(`Upload error: ${error}`);
              reject(error);
            }, () => {
              // if upload succeeds
              uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                resolve(downloadURL);
              });
            });
          },
          'blob'
        );
      });
    })).then(URLs => {
      console.log(URLs);
      setImages([...images, ...URLs]);
    })
  }

  const ImageError = () => {
    if (uploadError) {
      return <p className="error">Error uploading image. Please try again.</p>
    } else {
      return null;
    }
  }

  const UploadProgress = props => {
    if (uploadProgress >= 0) {
      return <Progress value={props.value} />
    } else {
      return null;
    }
  }

  return (
    <Form className="horse-form">
      {/* Ad Title */}
      <div className="horse-form-container">
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
      <ImagePreview images={images} setImages={setImages} />
      <div className="horse-form-container">
        <Input className="horse-form-input" type="file" onChange={onImageChange} multiple />
        <UploadProgress value={uploadProgress} />
        <ImageError />

      {/* Price */}

      {/* Location */}

      {/* Height */}

      {/* Description */}
      </div>
    </Form>
  )
}

export default NewHorse;
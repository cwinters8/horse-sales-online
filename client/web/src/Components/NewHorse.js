import React, {useState} from 'react';
import {Form, Input, Label} from 'reactstrap';
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

  const onImageChange = event => {
    const userID = props.firebase.auth().currentUser.uid;
    for (let i=0; i < event.target.files.length; i++) {
      const file = event.target.files[i];
      // resize image
      Resizer.imageFileResizer(
        file,
        900,
        900,
        'JPEG',
        100,
        0,
        uri => {
          const fileID = uuidv4();
          const fileName = `${fileID}.jpg`;
          // upload to firebase
          const imageRef = storageRef.child(`${userID}/${fileName}`);
          const uploadTask = imageRef.put(uri);
          uploadTask.on('state_changed', snapshot => {
            // track upload progress
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log(`Upload is ${progress}% done`);
          }, error => {
            // if upload fails
            console.log(`Upload error: ${error}`);
          }, () => {
            // if upload succeeds
            uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
              console.log(`Upload finished successfully. Download URL: ${downloadURL}`);
              setImages([...images, downloadURL]);
            });
          });
        },
        "blob"
      );
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

      {/* Price */}

      {/* Location */}

      {/* Height */}

      {/* Description */}
      </div>
    </Form>
  )
}

export default NewHorse;
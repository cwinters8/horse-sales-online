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
              setUploadProgress((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            }, error => {
              // if upload fails
              setUploadError(true);
              console.log(`Upload error: ${error}`);
              reject(error);
            }, () => {
              // if upload succeeds
              uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
                resolve({
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

  // TODO: persist input data across sessions in case the user refreshes the page
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
      <ImagePreview images={images} setImages={setImages} firebaseStorageRef={storageRef} />
      <div className="horse-form-container">
        <Input className="horse-form-input" type="file" onChange={onImageChange} multiple accept="image/*" />
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
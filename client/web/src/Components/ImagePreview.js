import React from 'react';
import {BsXCircle} from 'react-icons/bs';

const ImagePreview = props => {
  const images = props.images;
  const removeImage = imageIndex => {
    // remove image from Firebase
    const imageRef = props.firebaseStorageRef.child(images[imageIndex].path);
    imageRef.delete().then(() => {
      // remove image from preview
      const cleanedImages = images.splice(imageIndex, 1);
      props.setImages(cleanedImages);
    }).catch(error => {
      alert('Failed to delete image - please try again.');
    });
  }
  return (
    <div className="image-preview-container">
      {images.map((image, index) => {
        return (
          <div key={index} className="image-preview-individual-div">
            <img className="image-preview" src={image.url} alt="Upload preview" id={`preview-${index}`} />
            <BsXCircle className="x-circle" onClick={() => removeImage(index)} />
          </div>
        )
      })}
    </div>
  )
}

export default ImagePreview;
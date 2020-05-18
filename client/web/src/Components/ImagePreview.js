import React from 'react';
import {BsXCircle} from 'react-icons/bs';
import {Spinner} from 'reactstrap';

const ImagePreview = props => {
  if (props.images.length > 0) {
    return (
      <div className="image-preview-container">
        {props.images.map((image, index) => {
          if (image.loading) {
            return (
              <div key={image.id} className="image-preview-individual-div">
                <Spinner color="primary" className="image-preview" />
              </div>
            )
          }
          if (image.error) {
            return <p key={image.id}>Image ID {image.id} failed to upload</p>
          }
          return (
            <div key={image.id} className="image-preview-individual-div">
              <img className="image-preview" src={image.url} alt="Upload preview" />
              <BsXCircle className="x-circle" onClick={() => props.removeImage(index)} />
            </div>
          )
        })}
      </div>
    )
  } else {
    return null;
  }
}

export default ImagePreview;
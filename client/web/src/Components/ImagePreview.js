import React from 'react';
import {BsXCircle} from 'react-icons/bs';

const ImagePreview = props => {
  if (props.images.length > 0) {
    return (
      <div className="image-preview-container">
        {props.images.map((image, index) => {
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
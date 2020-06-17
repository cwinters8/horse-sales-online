import React from 'react';
import {BsXCircle} from 'react-icons/bs';
import {Spinner} from 'reactstrap';
import {SortableContainer, SortableElement, SortableHandle} from 'react-sortable-hoc';
import arrayMove from 'array-move';

const ImagePreview = props => {
  const dragStart = () => {
    document.body.style.cursor = 'grabbing';
  }
  const dragEnd = ({oldIndex, newIndex}) => {
    document.body.style.cursor = 'default';
    // reorder the array of images
    return props.setImages(arrayMove(props.images, oldIndex, newIndex));
  }
  const shouldCancelDrag = event => {
    // cancel drag if the 'x' is clicked so that click event can propagate correctly
    if (event.target.className.baseVal === 'x-circle') {
      return true;
    } else {
      return false;
    }
  }

  const ImageHandle = SortableHandle(({value}) => {
    return <img className="image-preview" src={value.url} alt="Upload preview" />
  });

  const SortableImage = SortableElement(({value, sortIndex}) => {
    return (
      <div className="image-preview-individual-div">
        <ImageHandle value={value} />
        <BsXCircle className="x-circle" size={15} onClick={() => props.removeImage(sortIndex)} />
      </div>
    );
  });

  const SortableList = SortableContainer(({images}) => {
    return (
      <div className="image-preview-container">
        {images.map((value, index) => {
          if (value.loading) {
            return (
              <div key={value.id} className="image-preview-individual-div">
                <Spinner color="primary" className="image-preview" />
              </div>
            );
          }
          if (value.error) {
            alert(`Image ID ${value.id} failed to upload`);
            return null;
          }
          return <SortableImage key={value.id} index={index} value={value} sortIndex={index} />
        })}
      </div>
    )
  });

  if (props.images.length > 0) {
    return (
      <SortableList images={props.images} axis="xy" onSortStart={dragStart} onSortEnd={dragEnd} shouldCancelStart={shouldCancelDrag} useDragHandle={true} />
    );
  } else {
    return null;
  }
}

export default ImagePreview;
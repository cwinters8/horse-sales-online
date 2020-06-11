import React from 'react';
import {BsXCircle} from 'react-icons/bs';
import {Spinner} from 'reactstrap';
import {DragDropContext, Draggable, Droppable} from 'react-beautiful-dnd';

const ImagePreview = props => {
  const dragEnd = result => {
    const {draggableId, source, destination} = result;
    // check if the user dropped the image outside of a droppable
    if (!destination) {
      return;
    }
    // check if the user returned the item to its original position
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    // reorder the array of images
    const newImages = props.images;
    const imageTarget = props.images[source.index];
    newImages.splice(source.index, 1);
    newImages.splice(destination.index, 0, imageTarget);
    props.setImages(newImages);
  }
  if (props.images.length > 0) {
    return (
      <DragDropContext onDragEnd={dragEnd}>
        <Droppable droppableId="droppable" direction="vertical">
          {(provided) => (
            <div className="image-preview-container" ref={provided.innerRef} {...provided.droppableProps}>
              {props.images.map((image, index) => {
                if (image.loading) {
                  return (
                    <div key={image.id} className="image-preview-individual-div">
                      <Spinner color="primary" className="image-preview" />
                    </div>
                  );
                }
                if (image.error) {
                  return <p key={image.id}>Image ID {image.id} failed to upload</p>
                }
                return (
                  <Draggable key={image.id} draggableId={image.id} index={index}>
                    {(provided) => (
                      <div className="image-preview-individual-div" ref={provided.innerRef} {...provided.draggableProps}>
                        <img className="image-preview" src={image.url} alt="Upload preview" {...provided.dragHandleProps} />
                        <BsXCircle className="x-circle" size={15} onClick={() => props.removeImage(index)} />
                      </div>
                    )}
                  </Draggable>
                )
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    )
  } else {
    return null;
  }
}

export default ImagePreview;
import React, {useState, useEffect} from 'react';
import ImageGallery from 'react-image-gallery';

const Horse = props => {
  const db = props.firebase.firestore();

  // STATE
  const [images, setImages] = useState([]);
  
  // HOOKS
  useEffect(() => {
    const unsubscribe = db.collection('horses').doc(props.horseID).onSnapshot(doc => {
      if (doc.exists) {
        const data = doc.data();
        console.log('Current data: ', data);
        // process data
        setImages(data.images);
      } else {
        // TODO: handle case where data is not found
        console.log('document not found');
      }
    });
    return () => {
      // unsubscribe from the document listener when the component unmounts
      console.log('unsubscribing...');
      unsubscribe();
    }
    // eslint-disable-next-line
  }, [props.firebase]);

  // 

  // DOM
  return (
    <div>
      <p>Horse ID {props.horseID}</p>
      <ImageGallery items={images.map(image => {
        return {
          original: image.url,
          thumbnail: image.url
        }
      })} showPlayButton={false} />
    </div>
  )
}

export default Horse;
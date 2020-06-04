import React, {useState, useEffect} from 'react';
import ImageGallery from 'react-image-gallery';
import NumberFormat from 'react-number-format';

const Horse = props => {
  const db = props.firebase.firestore();

  // STATE
  const [title, setTitle] = useState('');
  const [images, setImages] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(null);
  const [breed, setBreed] = useState([]);
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState(null);
  const [location, setLocation] = useState({});
  const [description, setDescription] = useState('');
  
  // HOOKS
  useEffect(() => {
    const unsubscribe = db.collection('horses').doc(props.horseID).onSnapshot(doc => {
      if (doc.exists) {
        const data = doc.data();
        console.log('Current data: ', data); // remove this
        // process data
        setTitle(data.title);
        setImages(data.images);
        setName(data.name);
        setPrice(data.price);
        setBreed(data.breed);
        setGender(data.gender);
        setHeight(data.height);
        setLocation(data.location);
        setDescription(data.description);
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

  // CHILD COMPONENTS
  const Price = () => {
    if (price) {
      return <NumberFormat displayType="text" thousandSeparator={true} prefix="$" value={price} />
    } else {
      return "Contact seller"
    }
  }

  // DOM
  return (
    <div>
      <h2 className="ad-title">{title}</h2>
      <div className="ad-main">
        <ImageGallery items={images.map(image => {
          return {
            original: image.url,
            thumbnail: image.url
          }
        })} showPlayButton={false} />
        <div className="ad-details">
          {name ? <p>Horse's name: {name}</p> : null}
          <p>Price: <Price /></p>
          {breed ? <p>Breed: {breed.join(', ')}</p> : null}
          {gender ? <p>Gender: {gender}</p> : null}
          {height ? <p>Height: {height}</p> : null}
          {location.label ? <p>Location: {location.label}</p> : null}
          {description ? <p>Description: {description}</p> : null}
        </div>
      </div>
    </div>
  )
}

export default Horse;
import React, {useState, useEffect} from 'react';
import ImageGallery from 'react-image-gallery';
import NumberFormat from 'react-number-format';
import {Button} from 'reactstrap';

// firebase
import firebase from '../Firebase';

const Horse = props => {
  const db = firebase.firestore();

  // STATE
  const [id, setId] = useState('');
  const [title, setTitle] = useState('');
  const [images, setImages] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState(null);
  const [breed, setBreed] = useState([]);
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState(null);
  const [location, setLocation] = useState({});
  const [description, setDescription] = useState('');
  const [ownerID, setOwnerID] = useState('');
  
  // HOOKS
  useEffect(() => {
    const unsubscribe = db.collection('horses').doc(props.horseID).onSnapshot(doc => {
      if (doc.exists) {
        const data = doc.data();
        // process data
        setId(doc.id);
        setTitle(data.title);
        setImages(data.images);
        setName(data.name);
        setPrice(data.price);
        setBreed(data.breed);
        setGender(data.gender);
        setHeight(data.height);
        setLocation(data.location);
        setDescription(data.description);
        setOwnerID(data.userID);
      } else {
        // TODO: handle case where data is not found - display a Not Found page/component
        console.log('document not found');
      }
    });
    return () => {
      // unsubscribe from the document listener when the component unmounts
      console.log('unsubscribing...');
      unsubscribe();
    }
    // eslint-disable-next-line
  }, [firebase]);
  

  // FUNCTIONS
  const edit = () => {
    window.location.href = `/horse/${id}/edit`;
  }

  // CHILD COMPONENTS
  const Price = () => {
    if (price !== null) {
      return <NumberFormat displayType="text" thousandSeparator={true} prefix="$" value={price} />
    } else {
      return "Contact seller"
    }
  }

  const Modify = () => {
    const currentUser = firebase.auth().currentUser;
    
    let userID;
    if (currentUser) {
      userID = firebase.auth().currentUser.uid;
      
    }
    if (userID === ownerID) {
      return (
        <div className="ad-modify">
          <Button color="primary" onClick={edit}>Edit</Button>
          <Button color="danger">Delete</Button>
        </div>
      )
    } else {
      return null;
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
          <Modify />
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
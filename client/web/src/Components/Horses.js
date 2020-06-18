import React, {useEffect, useState, useRef} from 'react';
import NumberFormat from 'react-number-format';

// firebase
import firebase from '../Firebase';

const Horses = () => {
  const db = firebase.firestore();

  // STATE
  const [horses, setHorses] = useState([]);
  const stateRef = useRef();
  stateRef.current = horses;
  
  // HOOKS
  // retrieving data
  useEffect(() => {
    const unsubscribe = db.collection('horses').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        const data = change.doc.data();
        const horse = {
          id: change.doc.id,
          title: data.title,
          image: data.images ? data.images[0] : null,
          price: data.price !== null ? data.price : "Contact seller",
          location: data.location,
          gender: data.gender,
          breed: data.breed
        };
        if (change.type === 'added') {
          setHorses(stateRef.current.concat(horse));
        } else if (change.type === 'modified') {
          const newHorses = stateRef.current.map(currentHorse => {
            if (change.doc.id === currentHorse.id) {
              return horse;
            } else {
              return currentHorse;
            }
          });
          setHorses(newHorses);
        } else if (change.type === 'removed') {
          const newHorses = stateRef.current.filter(currentHorse => horse.id !== currentHorse.id);
          setHorses(newHorses);
        }
      });
    });
    return () => {
      unsubscribe();
    }
  // eslint-disable-next-line
  }, [firebase]);

  // CHILD COMPONENTS
  const HorseCard = props => {
    const Image = () => {
      if (props.image) {
        return <img className="horse-card-image" src={props.image.url} alt="horse" />
      } else {
        return null;
      }
    }
    const Price = () => {
      if (typeof props.price === 'number') {
        return <NumberFormat displayType="text" thousandSeparator={true} prefix="$" value={props.price} />
      } else {
        return <p>{props.price}</p>
      }
    }
    const Location = () => {
      if (props.location) {
        return <p>{props.location.label}</p>
      } else {
        return null;
      }
    }
    const link = `/horse/${props.id}`;
    return (
      <div className="horse-card">
        <a href={link}><Image /></a>
        <div className="horse-card-text">
          <a href={link}><h3>{props.title}</h3></a>
          <Price />
          <p>{props.breed.join(', ')}</p>
          <p>{props.gender}</p>
          <Location />
        </div>
      </div>
    );
  }

  // DOM
  const horseCards = horses.map(horse => 
    <HorseCard
      key={horse.id}
      id={horse.id}
      title={horse.title}
      image={horse.image}
      price={horse.price}
      gender={horse.gender}
      location={horse.location}
      breed={horse.breed}
    />
  );
  return (
    <div className="horse-list">
      {horseCards}
    </div>
  );
}

export default Horses;
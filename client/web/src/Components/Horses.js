import React, {useEffect, useState} from 'react';
import NumberFormat from 'react-number-format';

const Horses = props => {
  const db = props.firebase.firestore();

  // STATE
  const [horses, setHorses] = useState([]);
  const [newHorse, setNewHorse] = useState(null);
  
  // HOOKS
  // retrieving data
  useEffect(() => {
    const unsubscribe = db.collection('horses').onSnapshot(snapshot => {
      const horsesArr = [];
      snapshot.docChanges().forEach(change => {
        console.log("Change caught:", change.type, change.doc.data());
        if (change.type === 'added') {
          const data = change.doc.data();
          // get id, title, first image, price, location, gender for each horse
          const horse = {
            id: change.doc.id,
            title: data.title,
            image: data.images ? data.images[0] : null,
            price: data.price || "Contact seller",
            location: data.location,
            gender: data.gender,
            breed: data.breed
          }
          horsesArr.push(horse);
        }
        // TODO: handle cases of update and delete
      });
      setNewHorse(horsesArr);
    });
    return () => {
      unsubscribe();
    }
  // eslint-disable-next-line
  }, [props.firebase]);

  // set horses state
  useEffect(() => {
    if (newHorse) {
      setHorses(horses.concat(newHorse));
    }
  // eslint-disable-next-line
  }, [newHorse]);

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
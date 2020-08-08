import React, {useEffect, useState, useRef} from 'react';
import NumberFormat from 'react-number-format';
import {Form, Label, Input, Button} from 'reactstrap';

// firebase
import firebase from '../Firebase';

const Horses = () => {
  const db = firebase.firestore();

  // STATE
  const [horses, setHorses] = useState([]);
  const [filteredHorses, setFilteredHorses] = useState([]);
  const [filtering, setFiltering] = useState(false);
  const [advancedSearch, setAdvancedSearch] = useState(false);
  const [generalSearchInput, setGeneralSearchInput] = useState('');
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

  // searching/filtering horses
  useEffect(() => {
    if (generalSearchInput && horses.length) {
      setFiltering(true);
      const input = generalSearchInput.toLowerCase();
      setFilteredHorses(horses.filter(horse => {
        // title
        if (horse.title.toLowerCase().includes(input)) {
          return true;
        }
        // gender
        if (horse.gender.toLowerCase().includes(input)) {
          return true;
        }
        // price
        if (horse.price.toString().includes(input)) {
          return true;
        }
        // location
        if (horse.location.label.toLowerCase().includes(input)) {
          return true;
        }
        // breed
        for (let j=0; j < horse.breed.length; j++) {
          if (horse.breed[j].toLowerCase().includes(input)) {
            return true;
          }
        }
        // catch all in case nothing returns true
        return false;
      }));
    } else {
      setFiltering(false);
    }
  // eslint-disable-next-line
  }, [generalSearchInput]);

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

  const AdvancedSearch = () => {
    if (advancedSearch) {
      return (
        <div className="advanced-search-container">
          <div>
            <Label for="breed">Breed</Label>
            <Input id="breed" />
          </div>
          <div>
            <Label for="location">Location</Label>
            <Input id="location" />
          </div>
          <div>
            <Label for="price">Price</Label>
            <Input id="price" />
          </div>
          <div>
            <Label for="gender">Gender</Label>
            <Input id="gender" />
          </div>
          <div>
            <Label for="height">Height</Label>
            <Input id="height" />
          </div>
        </div>
      );
    } else {
      return null;
    }
  }

  // DOM
  const horsesToDisplay = filtering ? filteredHorses : horses;
  const horseCards = horsesToDisplay.map(horse =>
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
    <div>
      <div>
        <Form className="search-form">
          <Input placeholder="Search..." className="search" onChange={event => setGeneralSearchInput(event.target.value)} value={generalSearchInput} />
          <Button color="primary" className="advanced-search" onClick={() => setAdvancedSearch(!advancedSearch)}>Advanced Search</Button>
          <AdvancedSearch />
        </Form>
      </div>
      <div className="horse-list">
        {horseCards}
      </div>
    </div>
  );
}

export default Horses;
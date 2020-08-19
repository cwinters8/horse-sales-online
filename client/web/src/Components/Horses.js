import React, {useEffect, useState, useRef} from 'react';
import NumberFormat from 'react-number-format';
import {Form, Label, Input, Button} from 'reactstrap';
import Select from 'react-select';

// import Location from './Location';
import Location from './Location';

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
  const [breeds, setBreeds] = useState([]);
  const [breedFilter, setBreedFilter] = useState([]);
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
          breed: data.breed,
          filteredOn: []
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
        const searchTerms = input.split(' ');
        return horseContainsArrayElements(horse, searchTerms);
      }));
    } else {
      setFiltering(false);
    }
  // eslint-disable-next-line
  }, [generalSearchInput]);

  // get list of individual breeds from horses data
  useEffect(() => {
    if (horses.length) {
      const uniqueBreeds = horses.map(horse => horse.breed).flat().reduce((limitedBreeds, breed) => {
        if (!limitedBreeds.includes(breed)) {
          limitedBreeds.push(breed);
        }
        return limitedBreeds;
      }, []);
      setBreeds(uniqueBreeds.map(breed => {
        return {
          label: breed,
          value: breed
        }
      }));
    }
  }, [horses]);

  // FUNCTIONS
  const horseContainsArrayElements = (horse, array) => {
    const generalFilterIndex = horse.filteredOn.findIndex(filter => filter === 'general');
    for (let i=0; i < array.length; i++) {
      const result = horseContainsString(horse, array[i]);
      // return false if the horse fails to contain any element in the array
      if (!result) {
        if (generalFilterIndex >= 0) {
          horse.filteredOn.splice(generalFilterIndex, 1);
        }
        return false;
      }
    }
    // return true if the horse contained all elements of the array
    if (generalFilterIndex < 0) {
      horse.filteredOn.push('general');
    }
    return true;
  }

  const horseContainsString = (horse, string) => {
    // title
    if (horse.title.toLowerCase().includes(string)) {
      return true;
    }
    // gender
    if (horse.gender.toLowerCase().includes(string)) {
      return true;
    }
    // price
    if (horse.price.toString().includes(string)) {
      return true;
    }
    // location
    if (horse.location.label.toLowerCase().includes(string)) {
      return true;
    }
    // breed
    for (let i=0; i < horse.breed.length; i++) {
      if (horse.breed[i].toLowerCase().includes(string)) {
        return true;
      }
    }
    // catch all in case nothing returns true
    return false;
  }

  const filterOnBreed = breedsToSearch => {
    setBreedFilter(breedsToSearch);
    if (breedsToSearch && breedsToSearch.length) {
      const breedValues = breedsToSearch.map(breed => breed.value);
      const horsesToFilter = filteredHorses.length ? filteredHorses : horses;
      // update filteredHorses state based on matching breeds
      setFiltering(true);
      const matchedHorses = horsesToFilter.filter(horse => {
        // loop through horse's breeds
        for (let i=0; i < horse.breed.length; i++) {
          // check if breedValues includes horse's breed
          if (breedValues.includes(horse.breed[i])) {
            if (!horse.filteredOn.includes('breed')) {
              horse.filteredOn.push('breed');
            }
            return true;
          }
        }
        return false;
      });
      setFilteredHorses(matchedHorses);
    } else {
      // remove 'breed' key from filteredOn for all horses
      horses.forEach(horse => {
        const breedFilterIndex = horse.filteredOn.findIndex(filter => filter === 'breed');
        if (breedFilterIndex >= 0) {
          horse.filteredOn.splice(breedFilterIndex, 1);
        }
      });
      // display all filtered if there are any horses that have been filtered
      const filtered = horses.filter(horse => horse.filteredOn.length);
      if (filtered.length) {
        setFilteredHorses(filtered);
      } else {
        // if no horses have been filtered, display all
        setFiltering(false);
      }
    }
  }

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
    const HorseLocation = () => {
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
          <HorseLocation />
        </div>
      </div>
    );
  }

  const AdvancedSearch = () => {
    const [location, setLocation] = useState({});
    const [radius, setRadius] = useState(50);
    const [radiusUnits, setRadiusUnits] = useState('miles');

    // filter by location here?
    useEffect(() => {
      console.log('location data from Adv Search component:', location.value, radius, radiusUnits);
    }, [location, radius, radiusUnits]);

    if (advancedSearch) {
      return (
        <div className="advanced-search-container">
          <div>
            <Label for="breed">Breed</Label>
            <Select className="horse-form-select" options={breeds} isMulti={true} onChange={filterOnBreed} value={breedFilter} />
          </div>
          <div>
            <Location setLocation={setLocation} location={location} />
          </div>
          <div className="advanced-search-radius">
            <Label for="radius">Search Radius</Label>
            <div>
              <Input id="radius" type="number" value={radius} onChange={event => setRadius(event.target.value)} />
              <select name="radius-units" id="radius-units" value={radiusUnits} onChange={event => setRadiusUnits(event.target.value)}>
                <option value="miles">mi</option>
                <option value="kilometers">km</option>
              </select>
            </div>
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
import React, {useState} from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom';

// firebase
import firebase from './Firebase';

// styles
import './App.css';
import 'react-google-places-autocomplete/dist/index.min.css';

// components
import Login from './Components/Login';
import PrivateRoute from './Components/PrivateRoute';
import NewHorse from './Components/NewHorse';
import Main from './Components/Main';
import Horse from './Components/Horse';
import Horses from './Components/Horses';

// images
import jumping from './images/jumping.png';
import dressage from './images/dressage.png';
import canter from './images/loping.png';
import cowPony from './images/CowPony.png';
import trail from './images/trailhorse.png';

const App = () => {
  const [userName, setUserName] = useState(null);

  // check if a user is signed in
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      setUserName(user.displayName);
      window.localStorage.setItem('user', user);
    } else {
      setUserName(null);
      window.localStorage.removeItem('user');
    }
  });

  const signOut = event => {
    event.preventDefault();
    firebase.auth().signOut().then(() => {
      // route to home on sign out for now
      window.location.href = '/';
    }); 
  }

  const NavHeaderRight = () => {
    if (userName) {
      return (
        <div className="header-right-grid">
          {/* TODO: link to a user's profile */}
          <p>Hello, <a href="/profile">{userName.split(' ')[0]}</a>!</p>
          <a onClick={signOut} href="/">Sign Out</a>
        </div>
      );
    } else {
      return (
        <div className="header-right-grid">
          <a href="/login">Login</a>
        </div>
      )
    }
  }

  const HeaderImages = () => {
    return (
      <div className="header-images">
        <img className="horse-image" src={jumping} alt="Jumping horse and rider" />
        <img className="horse-image" src={dressage} alt="Dressage horse and rider" />
        <img className="horse-image" src={canter} alt="Cantering horse and rider" />
        <img className="horse-image" src={cowPony} alt="Horse and rider working a cow" />
        <img className="horse-image" src={trail} alt="Trail horse and rider" />
      </div>
    )
  }

  const NavHeader = () => {
    return (
      <div className="header-grid">
        <p className="title"><a href="/">Horse Sales Online</a></p>
        <HeaderImages />
        <NavHeaderRight />
      </div>
    )
  }

  return (
    <div className="App">
      <header>
        <NavHeader />
      </header>
      <main>
        <BrowserRouter>
          <Switch>
            <Route exact path="/" render={() => <Main />} />
            <Route path="/login" render={() => <Login />} />
            <PrivateRoute path="/new-horse" render={() => <NewHorse />} />
            <Route exact path="/horse/:id" render={({match}) => <Horse horseID={match.params.id} />} />
            <PrivateRoute path="/horse/:id/edit" render={({match}) => <NewHorse horseID={match.params.id} />} />
            <Route path="/horses" render={() => <Horses />} />
          </Switch>
        </BrowserRouter>
      </main>
    </div>
  );
}

export default App;

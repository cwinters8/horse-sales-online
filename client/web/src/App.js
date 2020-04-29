import React, {useState} from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import {Nav, NavLink, NavItem, Container, Row, Col} from 'reactstrap';
import firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/auth';
import 'firebase/firestore';
import 'firebase/storage';

// styles
import './App.css';

// components
import Login from './Components/Login';
import PrivateRoute from './Components/PrivateRoute';
import NewHorse from './Components/NewHorse';
import Main from './Components/Main';

// images
import jumping from './images/jumping.png';
import dressage from './images/dressage.png';
import canter from './images/loping.png';
import cowPony from './images/CowPony.png';
import trail from './images/trailhorse.png';

// firebase config
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_APIKEY,
  authDomain: "horse-sales-online.firebaseapp.com",
  databaseURL: "https://horse-sales-online.firebaseio.com",
  projectId: "horse-sales-online",
  storageBucket: "horse-sales-online.appspot.com",
  messagingSenderId: "305569763111",
  appId: process.env.REACT_APP_FIREBASE_APPID,
  measurementId: "G-T7RWV4KJCF"
};
firebase.initializeApp(firebaseConfig);
firebase.analytics();

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

  const signOut = () => {
    firebase.auth().signOut().then(() => {
      // route to home on sign out for now
      window.location.href = '/';
    }); 
  }

  const NavHeader = () => {
    if (userName) {
      return (
        <Nav>
          <NavItem>
            <NavLink>{userName}</NavLink>
          </NavItem>
          <NavItem>
            <NavLink onClick={signOut} href="#">Sign Out</NavLink>
          </NavItem>
        </Nav>
      );
    } else {
      return (
        <Nav>
          <NavItem>
            <NavLink href="/login">Login</NavLink>
          </NavItem>
        </Nav>
      )
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <Container>
          <Row>
            <Col>
              <NavHeader />
            </Col>
          </Row>
          <Row>
            <Col>
              <img className="horse-image" src={jumping} alt="Jumping horse and rider" />
              <img className="horse-image" src={dressage} alt="Dressage horse and rider" />
              <img className="horse-image" src={canter} alt="Cantering horse and rider" />
              <img className="horse-image" src={cowPony} alt="Horse and rider working a cow" />
              <img className="horse-image" src={trail} alt="Trail horse and rider" />
            </Col>
          </Row>
          <Row>
            <Col><h1 className="header-title"><a id="title" href="/">Horse Sales Online</a></h1></Col>
          </Row>
        </Container>
        <BrowserRouter>
          <Switch>
            <Route exact path="/" render={() => <Main />} />
            <Route path="/login" render={() => <Login firebase={firebase} />} />
            <PrivateRoute path="/new-horse" render={() => <NewHorse firebase={firebase} />} />
          </Switch>
        </BrowserRouter>
      </header>
    </div>
  );
}

export default App;

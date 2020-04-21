import React from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import {Nav, NavLink, Container, Row, Col} from 'reactstrap';
import aes from 'crypto-js/aes';
import firebase from 'firebase/app';
import 'firebase/analytics';
import 'firebase/auth';
import 'firebase/firestore';

// styles
import './App.css';

// components
import Login from './Components/Login';

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
  // encrypts a given string using a secret key and returns the encrypted value
  const encrypt = string => {
    const encrypted = aes.encrypt(string, process.env.REACT_APP_SECRET_KEY).toString();
    return encrypted;
  }

  // decrypts an encrypted value to its original string
  const decrypt = encrypted => {
    const decrypted = aes.decrypt(encrypted, process.env.REACT_APP_SECRET_KEY).toString();
    return decrypted;
  }

  return (
    <div className="App">
      <header className="App-header">
        <Container>
          <Row>
            <Col>
              <Nav>
                <NavLink href="/login">Login</NavLink>
              </Nav>
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
            <Col><h1 className="header-title">Horse Sales Online</h1></Col>
          </Row>
        </Container>
        <BrowserRouter>
          <Switch>
            {/* Login */}
            <Route path="/login" render={() => <Login encrypt={encrypt} decrypt={decrypt} firebase={firebase} />} />
          </Switch>
        </BrowserRouter>
      </header>
    </div>
  );
}

export default App;

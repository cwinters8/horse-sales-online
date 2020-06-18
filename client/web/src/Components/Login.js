import React from 'react';
import {StyledFirebaseAuth} from 'react-firebaseui';

// firebase
import firebase from '../Firebase';

const Login = props => {
  const uiConfig = {
    signInFlow: 'redirect',
    signInSuccessUrl: localStorage.getItem('continue') || '/',
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID
    ]
  }

  return (
    <div>
      <p>Click one of the buttons below to sign in.</p>
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
    </div>
  );
}

export default Login;
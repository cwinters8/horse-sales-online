import React from 'react';
import {StyledFirebaseAuth} from 'react-firebaseui';

// firebase
import firebase from '../Firebase';
import mockFirebaseSdk from '../tests/firebaseMockSDK';

const firebaseSdk = process.env.NODE_ENV === 'test' ? mockFirebaseSdk : firebase;

const Login = props => {
  const uiConfig = {
    signInFlow: 'redirect',
    signInSuccessUrl: localStorage.getItem('continue') || '/',
    signInOptions: [
      firebaseSdk.auth.GoogleAuthProvider.PROVIDER_ID,
      firebaseSdk.auth.EmailAuthProvider.PROVIDER_ID
    ]
  }

  return (
    <div>
      <p>Click one of the buttons below to sign in.</p>
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebaseSdk.auth()} />
    </div>
  );
}

export default Login;
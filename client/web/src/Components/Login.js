import React from 'react';
import {StyledFirebaseAuth} from 'react-firebaseui';

const Login = props => {

  const uiConfig = {
    signInFlow: 'redirect',
    signInSuccessUrl: props.redirect || '/',
    signInOptions: [
      props.firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      props.firebase.auth.EmailAuthProvider.PROVIDER_ID,
      props.firebase.auth.FacebookAuthProvider.PROVIDER_ID
    ]
  }

  return (
    <div>
      <p>Click one of the buttons below to sign in.</p>
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={props.firebase.auth()} />
    </div>
  );
}

export default Login;
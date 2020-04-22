import React from 'react';
import {StyledFirebaseAuth} from 'react-firebaseui';

const Login = props => {

  const uiConfig = {
    signInFlow: 'redirect',
    signInSuccessUrl: '/',
    signInOptions: [
      props.firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      props.firebase.auth.EmailAuthProvider.PROVIDER_ID,
      props.firebase.auth.FacebookAuthProvider.PROVIDER_ID
    ]
  }

  return (
    <div>
      <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={props.firebase.auth()} />
    </div>
  );
}

export default Login;
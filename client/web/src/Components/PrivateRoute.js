import React from 'react';
import {Route, Redirect} from 'react-router-dom';

const PrivateRoute = ({path, callback, ...rest}) => {
  const fullPath = window.location.pathname;
  const user = window.localStorage.getItem('user');
  if (user) {
    return <Route path={path} render={callback} {...rest} />
  } else {
    localStorage.setItem('continue', fullPath);
    return <Redirect to='/login' />
  }
}

export default PrivateRoute;
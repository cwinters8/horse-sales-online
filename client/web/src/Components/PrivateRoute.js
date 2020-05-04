import React from 'react';
import {Route, Redirect} from 'react-router-dom';

const PrivateRoute = ({path, callback, ...rest}) => {
  const fullPath = window.location.pathname;
  const user = window.localStorage.getItem('user');
  if (user) {
    return <Route path={path} render={callback} {...rest} />
  } else {
    // FIXME: remove the continue item from local storage after a successful redirect so the user isn't later redirected again on subsequent logins
    localStorage.setItem('continue', fullPath);
    return <Redirect to='/login' />
  }
}

export default PrivateRoute;
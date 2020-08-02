import React from 'react';
import {render, screen, act} from '@testing-library/react';
import firebase from '../Firebase';

import App from '../App';

test('user is greeted if logged in', async () => {
  const {rerender} = render(<App />);
  let userName;
  await act(async () => {
    await firebase.auth().signInWithEmailAndPassword(
      process.env.REACT_APP_TEST_USER_EMAIL,
      process.env.REACT_APP_TEST_USER_PASSWORD
    ).then(response => {
      userName = response.user.displayName;
    }).catch(err => {
      console.error(err);
    })
  });
  rerender(<App />);
  screen.debug();
  const greeting = screen.getByText(/Hello,/);
  expect(greeting.firstElementChild.textContent).toEqual(userName.split(' ')[0]);
})
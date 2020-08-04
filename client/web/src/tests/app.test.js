import React from 'react';
import {Router} from 'react-router-dom';
import {createMemoryHistory} from 'history';
import {render, screen, act, fireEvent} from '@testing-library/react';
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
  const greeting = screen.getByText(/Hello,/);
  expect(greeting.firstElementChild.textContent).toEqual(userName.split(' ')[0]);
});

test('horses are rendered if user clicks "Find horses" link', async () => {
  const history = createMemoryHistory();
  const {getByTestId, findAllByTestId, debug} = render(
    <Router history={history}>
      <App />
    </Router>
  );
  const findHorses = getByTestId('findHorses');
  console.log(findHorses);
  fireEvent.click(findHorses);
  console.log('history location:', history.location);
  console.log('href:', window.location.href);
  const horses = await findAllByTestId('horseCard');
  debug();
  expect(horses.length).toBeGreaterThan(0);
});
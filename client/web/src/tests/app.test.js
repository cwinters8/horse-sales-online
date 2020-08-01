import React from 'react';
import {render, screen} from '@testing-library/react';

import App from '../App';

test('renders main App component', () => {
  render(<App />);
  screen.debug();
});
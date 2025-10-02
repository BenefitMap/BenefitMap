import { render, screen } from '@testing-library/react';
import App from './App';

// ESLint globals 설정
/* global test, expect */

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});

import { render, screen } from '@testing-library/react';
import Loading from './Loading';

describe('Loading', () => {
  it('renders loading text', () => {
    render(<Loading />);
    expect(screen.getByText('בטעינה...')).toBeInTheDocument();
  });
});


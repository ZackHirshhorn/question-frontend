import { render, screen } from '@testing-library/react';
import TextInput from './TextInput';

describe('TextInput', () => {
  it('renders input and optional check icon', () => {
    const { container } = render(<TextInput placeholder="שם" showCheck />);
    expect(screen.getByPlaceholderText('שם')).toBeInTheDocument();
    // CheckIcon renders an SVG; ensure there is an svg element present
    expect(container.querySelector('svg')).not.toBeNull();
  });

  it('renders without check icon when showCheck is false', () => {
    const { container } = render(<TextInput placeholder="שם" />);
    expect(container.querySelector('svg')).toBeNull();
  });
});


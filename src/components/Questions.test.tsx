import { render, screen, fireEvent } from '@testing-library/react';
import Questions from './Questions';

describe('Questions', () => {
  it('renders search input and new template button', () => {
    render(<Questions />);
    const input = screen.getByPlaceholderText('חיפוש') as HTMLInputElement;
    expect(input.value).toBe('');
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(input.value).toBe('abc');

    expect(screen.getByRole('button', { name: 'תבנית חדשה' })).toBeInTheDocument();
  });
});


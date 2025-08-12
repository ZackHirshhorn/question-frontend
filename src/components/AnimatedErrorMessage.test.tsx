import { render, screen } from '@testing-library/react';
import AnimatedErrorMessage from './AnimatedErrorMessage';
import { act } from 'react';

describe('AnimatedErrorMessage', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows and then clears message when removed', () => {
    const { rerender } = render(<AnimatedErrorMessage message="בעיה" />);
    expect(screen.getByText('בעיה')).toBeInTheDocument();

    rerender(<AnimatedErrorMessage message="" />);
    act(() => {
      vi.advanceTimersByTime(350);
    });
    expect(screen.queryByText('בעיה')).not.toBeInTheDocument();
  });
});


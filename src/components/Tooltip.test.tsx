import { render } from '@testing-library/react';
import Tooltip from './Tooltip';

describe('Tooltip', () => {
  it('toggles visibility class', () => {
    const { container, rerender } = render(<Tooltip text="טיפ" visible={false} />);
    const el = container.querySelector('.tooltip') as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.className).toBe('tooltip ');

    rerender(<Tooltip text="טיפ" visible={true} />);
    expect((container.querySelector('.tooltip') as HTMLElement).className).toContain('visible');
  });
});


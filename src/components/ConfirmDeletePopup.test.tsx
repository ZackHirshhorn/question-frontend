import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDeletePopup from './ConfirmDeletePopup';

describe('ConfirmDeletePopup', () => {
  it('renders message and fires callbacks', () => {
    const onClose = vi.fn();
    const onConfirm = vi.fn();

    render(
      <ConfirmDeletePopup
        message="בטוח למחוק?"
        onClose={onClose}
        onConfirm={onConfirm}
      />
    );

    expect(screen.getByText('בטוח למחוק?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'ביטול' }));
    expect(onClose).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'מחיקה' }));
    expect(onConfirm).toHaveBeenCalled();
  });
});


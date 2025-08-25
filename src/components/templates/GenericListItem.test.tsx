import { render, screen, fireEvent } from '@testing-library/react';
import GenericListItem from './GenericListItem';

describe('GenericListItem', () => {
  it('shows actions on hover and triggers onClick', () => {
    const onClick = vi.fn();
    const actionText = 'Action';
    render(
      <GenericListItem
        content="Item"
        onClick={onClick}
        actions={<button>{actionText}</button>}
      />
    );
    const item = screen.getByText('Item');
    fireEvent.mouseEnter(item.parentElement!);
    expect(screen.getByText(actionText)).toBeInTheDocument();
    fireEvent.click(item.parentElement!);
    expect(onClick).toHaveBeenCalled();
  });
});


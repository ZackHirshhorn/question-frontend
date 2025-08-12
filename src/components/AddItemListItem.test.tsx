import { render, screen, fireEvent } from '@testing-library/react';
import AddItemListItem from './AddItemListItem';

describe('AddItemListItem', () => {
  it('renders plus and text, handles click', () => {
    const onClick = vi.fn();
    render(<AddItemListItem text="הוספה" onClick={onClick} />);

    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('הוספה')).toBeInTheDocument();

    fireEvent.click(screen.getByText('הוספה'));
    expect(onClick).toHaveBeenCalled();
  });
});


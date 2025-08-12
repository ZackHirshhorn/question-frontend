import { render, screen, fireEvent } from '@testing-library/react';
import CreateTopicPopup from './CreateTopicPopup';

describe('CreateTopicPopup', () => {
  it('disables save on duplicate and shows error', () => {
    const onClose = vi.fn();
    const onCreate = vi.fn();
    render(
      <CreateTopicPopup
        subCategoryName="Sub"
        onClose={onClose}
        onCreate={onCreate}
        existingTopicNames={['X']}
      />
    );
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'X' } });
    expect(screen.getByText('נושא עם שם זה כבר קיים.')).toBeInTheDocument();
    const save = screen.getByRole('button', { name: 'שמור' });
    expect(save).toBeDisabled();
  });

  it('calls onCreate with trimmed names', () => {
    const onClose = vi.fn();
    const onCreate = vi.fn();
    render(
      <CreateTopicPopup
        subCategoryName="Sub"
        onClose={onClose}
        onCreate={onCreate}
        existingTopicNames={[]}
      />
    );
    const addButton = screen.getByRole('button', { name: 'הוסף עוד' });
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '  T1' } });
    fireEvent.click(addButton);
    const second = screen.getAllByRole('textbox')[1];
    fireEvent.change(second, { target: { value: 'T2  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'שמור' }));
    expect(onCreate).toHaveBeenCalledWith(['T1', 'T2']);
  });
});


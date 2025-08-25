import { render, screen, fireEvent } from '@testing-library/react';
import CreateNamesPopup from './CreateNamesPopup';

describe('CreateSubCategoryPopup (via CreateNamesPopup)', () => {
  it('disables save on duplicate and shows error', () => {
    const onClose = vi.fn();
    const onCreate = vi.fn();
    render(
      <CreateNamesPopup
        title={`הוספת תת קטגוריה חדשה עבור Cat`}
        fieldLabel="שם תת הקטגוריה"
        addButtonText="הוסף עוד"
        primaryButtonText="שמור"
        savingText="שומר…"
        duplicateErrorText="תת-קטגוריה עם שם זה כבר קיימת."
        existingNames={['Exist']}
        onClose={onClose}
        onCreate={onCreate}
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Exist' } });
    expect(screen.getByText('תת-קטגוריה עם שם זה כבר קיימת.')).toBeInTheDocument();
    const save = screen.getByRole('button', { name: 'שמור' });
    expect(save).toBeDisabled();
  });

  it('calls onCreate with trimmed, non-empty unique names', () => {
    const onClose = vi.fn();
    const onCreate = vi.fn();
    render(
      <CreateNamesPopup
        title={`הוספת תת קטגוריה חדשה עבור Cat`}
        fieldLabel="שם תת הקטגוריה"
        addButtonText="הוסף עוד"
        primaryButtonText="שמור"
        savingText="שומר…"
        duplicateErrorText="תת-קטגוריה עם שם זה כבר קיימת."
        existingNames={[]}
        onClose={onClose}
        onCreate={onCreate}
      />
    );
    const addButton = screen.getByRole('button', { name: 'הוסף עוד' });
    const inputs = screen.getAllByRole('textbox');
    fireEvent.change(inputs[0], { target: { value: '  A  ' } });
    fireEvent.click(addButton);
    const second = screen.getAllByRole('textbox')[1];
    fireEvent.change(second, { target: { value: 'B' } });
    const save = screen.getByRole('button', { name: 'שמור' });
    fireEvent.click(save);
    expect(onCreate).toHaveBeenCalledWith(['A', 'B']);
  });
});


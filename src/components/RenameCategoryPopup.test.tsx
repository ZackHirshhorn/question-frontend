import { render, screen, fireEvent } from '@testing-library/react';
import RenameCategoryPopup from './RenameCategoryPopup';

describe('RenameCategoryPopup', () => {
  it('disables save on duplicate and unchanged, enables on unique', () => {
    const onClose = vi.fn();
    const onSave = vi.fn();
    render(
      <RenameCategoryPopup
        currentName="Orig"
        onClose={onClose}
        onSave={onSave}
        title="שינוי שם"
        existingNames={["Dup", "Another"]}
      />
    );

    const input = screen.getByRole('textbox');
    const save = screen.getByRole('button', { name: 'שמירה' });

    // Unchanged -> disabled
    expect(save).toBeDisabled();

    // Duplicate -> disabled with error
    fireEvent.change(input, { target: { value: 'Dup' } });
    expect(screen.getByText('שם זה כבר קיים.')).toBeInTheDocument();
    expect(save).toBeDisabled();

    // Unique -> enabled, and calls onSave
    fireEvent.change(input, { target: { value: 'NewName' } });
    expect(save).not.toBeDisabled();
    fireEvent.click(save);
    expect(onSave).toHaveBeenCalledWith('NewName');
  });
});


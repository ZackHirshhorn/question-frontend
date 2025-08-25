import { render, screen } from '@testing-library/react';
import CreateNamesPopup from './CreateNamesPopup';

describe('CreateNamesPopup - Category variant', () => {
  it('renders category labels and disables primary initially', () => {
    const onClose = vi.fn();
    const onCreate = vi.fn();
    render(
      <CreateNamesPopup
        title="יצירת קטגוריה חדשה"
        fieldLabel="שמות הקטגוריות"
        addButtonText="הוסף קטגוריה נוספת"
        primaryButtonText="יצירה"
        duplicateErrorText="קטגוריה עם שם זה כבר קיימת."
        existingNames={[]}
        onClose={onClose}
        onCreate={onCreate}
      />
    );

    expect(screen.getByRole('heading', { name: 'יצירת קטגוריה חדשה' })).toBeInTheDocument();
    expect(screen.getByText('שמות הקטגוריות')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'הוסף קטגוריה נוספת' })).toBeInTheDocument();
    const primary = screen.getByRole('button', { name: 'יצירה' });
    expect(primary).toBeDisabled();
  });

  it('shows spinner state while keeping primary text when saving', () => {
    const onClose = vi.fn();
    const onCreate = vi.fn();
    render(
      <CreateNamesPopup
        title="יצירת קטגוריה חדשה"
        fieldLabel="שמות הקטגוריות"
        addButtonText="הוסף קטגוריה נוספת"
        primaryButtonText="יצירה"
        duplicateErrorText="קטגוריה עם שם זה כבר קיימת."
        existingNames={[]}
        onClose={onClose}
        onCreate={onCreate}
        saving
      />
    );

    const primary = screen.getByRole('button', { name: 'יצירה' });
    expect(primary).toHaveAttribute('aria-busy', 'true');
  });
});


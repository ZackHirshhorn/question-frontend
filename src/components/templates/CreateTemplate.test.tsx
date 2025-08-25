import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import CreateTemplate from './CreateTemplatePopup';

describe('CreateTemplate', () => {
  it('should display an error message when trying to create a template with duplicate category names', () => {
    const handleClose = vi.fn();
    const handleTemplateCreated = vi.fn();

    render(
      <CreateTemplate
        onClose={handleClose}
        onTemplateCreated={handleTemplateCreated}
        existingTemplateNames={[]}
      />
    );

    const textboxes = screen.getAllByRole('textbox');
    const templateNameInput = textboxes[0];
    let categoryInputs = textboxes.slice(1);

    // Add a template name
    fireEvent.change(templateNameInput, { target: { value: 'Test Template' } });

    // Add first category
    fireEvent.change(categoryInputs[0], { target: { value: 'Category 1' } });

    // Add second category with the same name
    fireEvent.click(screen.getByText('הוסף קטגוריה'));
    categoryInputs = screen.getAllByRole('textbox').slice(1);
    fireEvent.change(categoryInputs[1], { target: { value: 'Category 1' } });

    // Submit the form
    fireEvent.click(screen.getByText('יצירה'));

    // Check for error message
    expect(screen.getByText('לא ניתן להוסיף קטגוריות עם אותו שם.')).toBeInTheDocument();
  });
});

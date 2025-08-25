import { render, screen, fireEvent, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import CreateQuestionsCol from './CreateQuestionsColPopup';

// Mock API (not called in this test)
vi.mock('../../api/questions', () => ({
  createQuestionsCol: vi.fn(),
  updateQuestionCollection: vi.fn(),
}));

describe('CreateQuestionsCol does not persist answers', () => {
  const LS_KEY = 'create_questions_col_saved_questions';

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('does not persist numberValue for number questions when saving', async () => {
    const onClose = vi.fn();
    const onCreated = vi.fn();

    render(
      <CreateQuestionsCol onClose={onClose} onCreated={onCreated} existingNames={[]} />
    );

    // Add a question draft
    fireEvent.click(screen.getByRole('button', { name: 'הוסף שאלה חדשה +' }));

    // Choose number type via custom dropdown
    const selects = screen.getAllByRole('combobox');
    fireEvent.click(selects[0]);
    const listbox = await screen.findByRole('listbox');
    const numberOption = within(listbox).getByRole('option', { name: 'מספר' });
    fireEvent.click(numberOption);

    // Enter a number answer (should NOT be persisted)
    const numberInput = screen.getByRole('spinbutton');
    fireEvent.change(numberInput, { target: { value: '42' } });

    // Give question a title so save is enabled
    const textInput = screen.getByPlaceholderText('הזן את השאלה');
    fireEvent.change(textInput, { target: { value: 'מספר לדוגמה' } });

    // Save the draft question
    fireEvent.click(screen.getByRole('button', { name: 'שמור שאלה' }));

    const saved = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    expect(saved.length).toBe(1);
    expect(saved[0].qType).toBe('מספר');
    expect('numberValue' in saved[0]).toBe(false);
  });
});

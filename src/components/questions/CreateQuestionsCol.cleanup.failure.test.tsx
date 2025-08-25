import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import CreateQuestionsCol from './CreateQuestionsColPopup';

// Mock API to simulate failure
vi.mock('../../api/questions', () => ({
  createQuestionsCol: vi.fn().mockRejectedValue({ response: { data: { message: 'שגיאה' } } }),
  updateQuestionCollection: vi.fn().mockResolvedValue({ data: {} }),
}));

import { createQuestionsCol } from '../../api/questions';

describe('CreateQuestionsCol localStorage is not cleared on failure', () => {
  const LS_KEY = 'create_questions_col_saved_questions';

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('preserves localStorage when API call fails', async () => {
    const savedQuestions = [
      { q: 'שאלה לדוגמה', qType: 'טקסט', required: false, choice: [] },
    ];
    localStorage.setItem(LS_KEY, JSON.stringify(savedQuestions));

    const onClose = vi.fn();
    const onCreated = vi.fn();

    render(
      <CreateQuestionsCol onClose={onClose} onCreated={onCreated} existingNames={[]} />
    );

    // Fill name and attempt submit
    const nameInput = screen.getByLabelText('כותרת התבנית');
    fireEvent.change(nameInput, { target: { value: 'תבנית חדשה' } });
    const submitButton = screen.getByRole('button', { name: 'צור תבנית' });
    fireEvent.click(submitButton);

    // API called and rejected
    await waitFor(() => {
      expect(createQuestionsCol).toHaveBeenCalledTimes(1);
    });

    // Ensure the error did not clear localStorage
    expect(localStorage.getItem(LS_KEY)).not.toBeNull();
  });
});

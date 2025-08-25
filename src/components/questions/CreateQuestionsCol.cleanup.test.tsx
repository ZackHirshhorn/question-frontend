import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import CreateQuestionsCol from './CreateQuestionsColPopup';

vi.mock('../../api/questions', () => ({
  createQuestionsCol: vi.fn().mockResolvedValue({ data: {} }),
  updateQuestionCollection: vi.fn().mockResolvedValue({ data: {} }),
}));

import { createQuestionsCol } from '../../api/questions';

describe('CreateQuestionsCol localStorage cleanup', () => {
  const LS_KEY = 'create_questions_col_saved_questions';

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('clears saved questions from localStorage after successful submit', async () => {
    const savedQuestions = [
      { q: 'שאלה לדוגמה', qType: 'טקסט', required: false, choice: [] },
    ];
    localStorage.setItem(LS_KEY, JSON.stringify(savedQuestions));

    const onClose = vi.fn();
    const onCreated = vi.fn();

    render(
      <CreateQuestionsCol
        onClose={onClose}
        onCreated={onCreated}
        existingNames={[]}
      />
    );

    // Ensure precondition
    expect(localStorage.getItem(LS_KEY)).not.toBeNull();

    // Fill name and submit
    const nameInput = screen.getByLabelText('כותרת התבנית');
    fireEvent.change(nameInput, { target: { value: 'תבנית חדשה' } });

    const submitButton = screen.getByRole('button', { name: 'צור תבנית' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createQuestionsCol).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(localStorage.getItem(LS_KEY)).toBeNull();
    });
  });
});

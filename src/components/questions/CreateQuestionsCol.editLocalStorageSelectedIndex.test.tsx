import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import CreateQuestionsCol from './CreateQuestionsColPopup';

// Mock API to avoid real network calls
vi.mock('../../api/questions', () => ({
  createQuestionsCol: vi.fn().mockResolvedValue({ data: {} }),
  updateQuestionCollection: vi.fn().mockResolvedValue({ data: {} }),
}));

describe('CreateQuestionsCol edit preserves schema (no selectedIndex persisted)', () => {
  const LS_KEY = 'create_questions_col_saved_questions';

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('removes selectedIndex when saving an edited single-choice question', async () => {
    // Pre-populate saved questions so the popup shows a question to edit
    const initial = [
      { q: 'בחר אפשרות', qType: 'בחירה יחידה', required: false, choice: ['א', 'ב'] },
    ];
    localStorage.setItem(LS_KEY, JSON.stringify(initial));

    const onClose = vi.fn();
    const onCreated = vi.fn();

    render(
      <CreateQuestionsCol onClose={onClose} onCreated={onCreated} existingNames={[]} />
    );

    // Enter edit mode for the first question
    const editButtons = await screen.findAllByRole('button', { name: 'עריכה' });
    fireEvent.click(editButtons[0]);

    // Select the first option (this sets selectedIndex in the draft)
    const radios = await screen.findAllByRole('radio');
    fireEvent.click(radios[0]);

    // Save the edited question
    const saveBtn = screen.getByRole('button', { name: 'שמור שאלה' });
    fireEvent.click(saveBtn);

    // Verify localStorage contains no selectedIndex for the question
    const parsed = JSON.parse(localStorage.getItem(LS_KEY) || '[]');
    expect(parsed.length).toBe(1);
    expect('selectedIndex' in parsed[0]).toBe(false);
    expect(parsed[0].qType).toBe('בחירה יחידה');
    expect(Array.isArray(parsed[0].choice)).toBe(true);
  });
});

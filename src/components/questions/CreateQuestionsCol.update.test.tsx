import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import CreateQuestionsCol from './CreateQuestionsColPopup';
import { createQuestionsCol, updateQuestionCollection } from '../../api/questions';

vi.mock('../../api/questions', () => ({
  createQuestionsCol: vi.fn().mockResolvedValue({ data: {} }),
  updateQuestionCollection: vi.fn().mockResolvedValue({ data: {} }),
}));

describe('CreateQuestionsCol editing flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses the update API and preserves backend qType values when editing', async () => {
    render(
      <CreateQuestionsCol
        onClose={vi.fn()}
        onCreated={vi.fn()}
        existingNames={[]}
        initial={{
          id: 'col-1',
          name: 'Existing Collection',
          description: 'Desc',
          questions: [
            {
              id: 'q-1',
              q: 'מה שלומך?',
              qType: 'Multiple',
              required: true,
              choice: ['טוב', 'בסדר'],
            },
          ],
        }}
      />
    );

    const submitButton = screen.getByRole('button', { name: 'שמור שינויים' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(updateQuestionCollection).toHaveBeenCalledTimes(1);
    });
    expect(createQuestionsCol).not.toHaveBeenCalled();

    const updateMock = vi.mocked(updateQuestionCollection);
    const [, payload] = updateMock.mock.calls[0];
    expect(payload).toMatchObject({
      colName: 'Existing Collection',
      description: 'Desc',
    });
    expect(Array.isArray(payload.questions)).toBe(true);
    expect(payload.questions?.[0]).toMatchObject({
      id: 'q-1',
      qType: 'Multiple',
      required: true,
      choice: ['טוב', 'בסדר'],
    });
  });
});

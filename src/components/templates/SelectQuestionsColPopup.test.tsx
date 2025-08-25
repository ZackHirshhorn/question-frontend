import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import questionCollectionsReducer, { type QuestionCollection } from '../../store/questionCollectionsSlice';
import SelectQuestionsColPopup from './SelectQuestionsColPopup';

vi.mock('../../api/questions', async () => {
  const actual = await vi.importActual<typeof import('../../api/questions')>('../../api/questions');
  return {
    ...actual,
    searchQuestionCollections: vi.fn().mockResolvedValue({
      data: { collection: [{ _id: '1', name: 'A', description: 'desc', size: 3 }] },
    }),
  };
});

describe('SelectQuestionsColPopup', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  const makeStore = (preloaded?: { items?: QuestionCollection[] }) =>
    configureStore({
      reducer: { questionCollections: questionCollectionsReducer },
      preloadedState: preloaded
        ? { questionCollections: { items: preloaded.items || [], loading: false, error: null, allNames: [] } }
        : undefined,
    });

  it('fetches collections and allows selecting one', async () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();
    const store = makeStore();

    render(
      <Provider store={store}>
        <SelectQuestionsColPopup onClose={onClose} onSelect={onSelect} />
      </Provider>
    );

    // Wait for fetched item to appear
    expect(await screen.findByText('A')).toBeInTheDocument();

    // Select and confirm (match the radio by its accessible name)
    fireEvent.click(screen.getByRole('radio', { name: /A/ }));
    fireEvent.click(screen.getByRole('button', { name: 'בחירה' }));

    await waitFor(() => expect(onSelect).toHaveBeenCalled());
    const selected = (onSelect.mock.calls[0]?.[0]) as QuestionCollection;
    expect(selected._id).toBe('1');
    expect(onClose).toHaveBeenCalled();
  });

  it('uses existing collections from store without refetching', async () => {
    const { searchQuestionCollections } = await import('../../api/questions');
    const onClose = vi.fn();
    const onSelect = vi.fn();
    const store = makeStore({ items: [{ _id: 'x', name: 'X' }] });

    render(
      <Provider store={store}>
        <SelectQuestionsColPopup onClose={onClose} onSelect={onSelect} />
      </Provider>
    );

    expect(await screen.findByText('X')).toBeInTheDocument();
    // Cast to Vitest Mock to assert on call state without using 'any'
    expect((searchQuestionCollections as unknown as import('vitest').Mock)).not.toHaveBeenCalled();
  });

  it('preselects the provided initialSelectedId when present', async () => {
    const onClose = vi.fn();
    const onSelect = vi.fn();
    const store = makeStore({ items: [{ _id: 'y', name: 'Preselected' }] });

    render(
      <Provider store={store}>
        <SelectQuestionsColPopup onClose={onClose} onSelect={onSelect} initialSelectedId={'y'} />
      </Provider>
    );

    const radio = await screen.findByRole('radio', { name: /Preselected/ });
    expect((radio as HTMLInputElement).checked).toBe(true);
  });
});

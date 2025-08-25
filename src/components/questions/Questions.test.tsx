import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../../store';
import Questions from './Questions';
import * as questionsApi from '../../api/questions';

describe('Questions', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(questionsApi, 'searchQuestionCollections').mockResolvedValue({ data: { collection: [] } } as unknown as ReturnType<typeof questionsApi.searchQuestionCollections>);
    vi.spyOn(questionsApi, 'getQuestionCollection').mockResolvedValue({ data: { name: '', description: '', questions: [] } } as unknown as ReturnType<typeof questionsApi.getQuestionCollection>);
  });
  it('renders search input and new template button', () => {
    render(
      <Provider store={store}>
        <Questions />
      </Provider>
    );
    const input = screen.getByPlaceholderText('חיפוש') as HTMLInputElement;
    expect(input.value).toBe('');
    fireEvent.change(input, { target: { value: 'abc' } });
    expect(input.value).toBe('abc');

    expect(screen.getByRole('button', { name: 'תבנית חדשה' })).toBeInTheDocument();
  });

  it('loads collections and opens preview popup', async () => {
    vi.spyOn(questionsApi, 'searchQuestionCollections').mockResolvedValue({
      data: { collection: [{ _id: '1', name: 'A', description: 'D', size: 0 }] },
    } as unknown as ReturnType<typeof questionsApi.searchQuestionCollections>);
    vi.spyOn(questionsApi, 'getQuestionCollection').mockResolvedValue({
      data: { name: 'A', description: 'D', questions: [{ q: 'Q1', qType: 'Text' }] },
    } as unknown as ReturnType<typeof questionsApi.getQuestionCollection>);

    render(
      <Provider store={store}>
        <Questions />
      </Provider>
    );
    const name = await screen.findByText('A');
    // hover and click preview icon (first icon in the card actions)
    fireEvent.mouseEnter(name.parentElement!);
    const buttons = await screen.findAllByRole('button');
    // Find the preview button by its aria-label
    const previewBtn = buttons.find((b) => b.getAttribute('aria-label') === 'תצוגה מקדימה')!;
    fireEvent.click(previewBtn);

    // Popup appears and eventually shows question
    await screen.findByRole('dialog');
    await waitFor(() => expect(screen.getByText('Q1')).toBeInTheDocument());
  });

  it('opens create modal from card click and from plus-one', async () => {
    vi.spyOn(questionsApi, 'searchQuestionCollections').mockResolvedValue({
      data: { collection: [{ _id: '1', name: 'A', description: 'D', size: 0 }] },
    } as unknown as ReturnType<typeof questionsApi.searchQuestionCollections>);
    vi.spyOn(questionsApi, 'getQuestionCollection').mockResolvedValue({
      data: { name: 'A', description: 'D', questions: [] },
    } as unknown as ReturnType<typeof questionsApi.getQuestionCollection>);

    render(
      <Provider store={store}>
        <Questions />
      </Provider>
    );
    const cardTitle = await screen.findByText('A');
    // Click the card area opens create (click title and let event bubble)
    fireEvent.click(cardTitle);
    // Close button should be present in the create modal
    expect(await screen.findByRole('button', { name: 'סגור' })).toBeInTheDocument();

    // Close and try via plus-one button
    fireEvent.click(screen.getByRole('button', { name: 'סגור' }));
    const title2 = await screen.findByText('A');
    fireEvent.mouseEnter(title2.parentElement!);
    const plusOne = Array.from(await screen.findAllByRole('button')).find((b) => b.getAttribute('aria-label') === 'פלוס אחד')!;
    fireEvent.click(plusOne);
    expect(await screen.findByRole('button', { name: 'סגור' })).toBeInTheDocument();
  });
});

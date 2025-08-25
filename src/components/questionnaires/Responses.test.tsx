import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Responses from './Responses';
import * as templateApi from '../../api/template';
import type { QuestionnaireResponse } from '../../api/template';

const buildResponse = (index: number, overrides: Partial<QuestionnaireResponse> = {}): QuestionnaireResponse => {
  const day = String(index).padStart(2, '0');
  const zeroBased = index - 1;
  return {
    id: `response-${index}`,
    templateId: '1',
    template: {
      name: 'שאלון 1',
      categories: [],
    },
    userName: `נמען ${index}`,
    userEmail: `user${index}@example.com`,
    userPhone: `050-000000${index}`,
    schoolName: null,
    isComplete: zeroBased % 2 === 0,
    createdAt: `2024-09-${day}T08:00:00.000Z`,
    updatedAt: `2024-09-${day}T12:00:00.000Z`,
    ...overrides,
  };
};

const mockTemplateResponses: QuestionnaireResponse[] = Array.from({ length: 5 }, (_, index) =>
  buildResponse(index + 1),
);

const mockSingleTemplateSummaryApi = (responses: QuestionnaireResponse[] = mockTemplateResponses) => {
  return vi.spyOn(templateApi, 'getSingleTemplateSummary').mockResolvedValue({
    data: { responses },
  } as unknown as ReturnType<typeof templateApi.getSingleTemplateSummary>);
};

describe('Responses', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders summaries returned by the API', async () => {
    vi.spyOn(templateApi, 'getTemplatesSummary').mockResolvedValue({
      data: [
        { id: '1', name: 'שאלון 1', responses: 3, complete: 2, incomplete: 1 },
      ],
    } as unknown as ReturnType<typeof templateApi.getTemplatesSummary>);

    render(<Responses />);

    expect(await screen.findByPlaceholderText('חיפוש')).toBeInTheDocument();
    expect(await screen.findByText('שאלון 1')).toBeInTheDocument();
    expect(screen.getByLabelText('סהכ תגובות')).toHaveTextContent('3');
    expect(screen.getByLabelText('הושלמו')).toHaveTextContent('2');
    expect(screen.getByLabelText('לא הושלמו')).toHaveTextContent('1');
  });

  it('shows an error message when the API call fails', async () => {
    vi.spyOn(templateApi, 'getTemplatesSummary').mockRejectedValue(new Error('boom'));

    render(<Responses />);

    expect(
      await screen.findByText('שגיאה בטעינת סיכום התגובות. נסו שוב מאוחר יותר.'),
    ).toBeInTheDocument();
  });

  it('renders empty state when no summaries are returned', async () => {
    vi.spyOn(templateApi, 'getTemplatesSummary').mockResolvedValue({
      data: [],
    } as unknown as ReturnType<typeof templateApi.getTemplatesSummary>);

    render(<Responses />);

    expect(await screen.findByText('אין תגובות להצגה.')).toBeInTheDocument();
  });

  it('loads and displays responses from the API when a template card is selected', async () => {
    vi.spyOn(templateApi, 'getTemplatesSummary').mockResolvedValue({
      data: [
        { id: '1', name: 'שאלון 1', responses: 3, complete: 2, incomplete: 1 },
      ],
    } as unknown as ReturnType<typeof templateApi.getTemplatesSummary>);
    mockSingleTemplateSummaryApi();

    render(<Responses />);

    const templateHeading = await screen.findByRole('heading', { name: 'שאלון 1' });
    const templateCard = templateHeading.closest('[role="button"]');
    expect(templateCard).not.toBeNull();
    fireEvent.click(templateCard!);

    expect(await screen.findByRole('heading', { name: 'שאלון 1', level: 2 })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('חיפוש')).not.toBeInTheDocument();
    const statsGroup = screen.getByRole('group', { name: 'סטטוס תגובות' });
    expect(statsGroup).toHaveTextContent(/תגובות\s*5/);
    expect(statsGroup).toHaveTextContent(/3\s*הושלמו/);
    expect(statsGroup).toHaveTextContent(/2\s*לא הושלמו/);

    const respondentCells = await screen.findAllByLabelText('שם המשיב');
    expect(respondentCells.map((el) => el.textContent)).toEqual(
      expect.arrayContaining(['נמען 1', 'נמען 2', 'נמען 3', 'נמען 4', 'נמען 5']),
    );
    expect(screen.queryByText('<שם התגובה>')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('שם מוסד')).toBeNull();

    const statusCells = screen.getAllByLabelText(/סטטוס תגובה/);
    expect(statusCells).toHaveLength(5);
    expect(statusCells.every((cell) => cell.textContent === '')).toBe(true);

    expect(screen.getAllByLabelText('תאריך עדכון')[0]).toHaveTextContent('01/09/2024');
  });

  it('shows an error message when loading template responses fails', async () => {
    vi.spyOn(templateApi, 'getTemplatesSummary').mockResolvedValue({
      data: [
        { id: '1', name: 'שאלון 1', responses: 3, complete: 2, incomplete: 1 },
      ],
    } as unknown as ReturnType<typeof templateApi.getTemplatesSummary>);
    vi.spyOn(templateApi, 'getSingleTemplateSummary').mockRejectedValue({
      isAxiosError: true,
      response: {
        data: { message: 'לא נמצאו תשובות לשאלון זה' },
      },
    });

    render(<Responses />);

    const templateHeading = await screen.findByRole('heading', { name: 'שאלון 1' });
    const templateCard = templateHeading.closest('[role="button"]');
    expect(templateCard).not.toBeNull();
    fireEvent.click(templateCard!);

    expect(
      await screen.findByText('לא נמצאו תשובות לשאלון זה'),
    ).toBeInTheDocument();
  });

  it('filters responses by completion status', async () => {
    vi.spyOn(templateApi, 'getTemplatesSummary').mockResolvedValue({
      data: [
        { id: '1', name: 'שאלון 1', responses: 3, complete: 2, incomplete: 1 },
      ],
    } as unknown as ReturnType<typeof templateApi.getTemplatesSummary>);
    mockSingleTemplateSummaryApi();

    render(<Responses />);

    const templateHeading = await screen.findByRole('heading', { name: 'שאלון 1' });
    const templateCard = templateHeading.closest('[role="button"]');
    expect(templateCard).not.toBeNull();
    fireEvent.click(templateCard!);

    await screen.findByRole('heading', { name: 'שאלון 1', level: 2 });
    await waitFor(() => expect(screen.getAllByLabelText('שם המשיב')).toHaveLength(5));

    const completedButton = screen.getByRole('button', { name: 'הושלם' });
    fireEvent.click(completedButton);
    await waitFor(() => expect(screen.getAllByLabelText('שם המשיב')).toHaveLength(3));
    expect(completedButton).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(completedButton);
    await waitFor(() => expect(screen.getAllByLabelText('שם המשיב')).toHaveLength(5));
    expect(completedButton).toHaveAttribute('aria-pressed', 'false');

    const incompleteButton = screen.getByRole('button', { name: 'לא הושלם' });
    fireEvent.click(incompleteButton);
    await waitFor(() => expect(screen.getAllByLabelText('שם המשיב')).toHaveLength(2));
    expect(incompleteButton).toHaveAttribute('aria-pressed', 'true');
  });

  it('filters responses by date range when search is applied', async () => {
    vi.spyOn(templateApi, 'getTemplatesSummary').mockResolvedValue({
      data: [
        { id: '1', name: 'שאלון 1', responses: 5, complete: 3, incomplete: 2 },
      ],
    } as unknown as ReturnType<typeof templateApi.getTemplatesSummary>);
    mockSingleTemplateSummaryApi();

    render(<Responses />);

    const templateHeading = await screen.findByRole('heading', { name: 'שאלון 1' });
    const templateCard = templateHeading.closest('[role="button"]');
    expect(templateCard).not.toBeNull();
    fireEvent.click(templateCard!);

    await waitFor(() => expect(screen.getAllByLabelText('שם המשיב')).toHaveLength(5));

    const fromInput = screen.getByLabelText('מתאריך', { selector: 'input' }) as HTMLInputElement;
    const toInput = screen.getByLabelText('עד תאריך', { selector: 'input' }) as HTMLInputElement;
    const searchButton = screen.getByRole('button', { name: 'חפש' });

    fireEvent.change(fromInput, { target: { value: '2024-09-02' } });
    fireEvent.click(searchButton);
    expect(await screen.findByText('יש לבחור שני תאריכים')).toBeInTheDocument();
    await waitFor(() => expect(screen.getAllByLabelText('שם המשיב')).toHaveLength(5));

    fireEvent.change(toInput, { target: { value: '2024-09-03' } });
    fireEvent.click(searchButton);
    await waitFor(() => expect(screen.queryByText('יש לבחור שני תאריכים')).not.toBeInTheDocument());
    await waitFor(() => expect(screen.getAllByLabelText('שם המשיב')).toHaveLength(2));

    fireEvent.change(fromInput, { target: { value: '2024-09-04' } });
    fireEvent.change(toInput, { target: { value: '2024-09-02' } });
    fireEvent.click(searchButton);
    await waitFor(() => expect(screen.getAllByLabelText('שם המשיב')).toHaveLength(3));

    fireEvent.change(fromInput, { target: { value: '' } });
    fireEvent.change(toInput, { target: { value: '' } });
    fireEvent.click(searchButton);
    await waitFor(() => expect(screen.getAllByLabelText('שם המשיב')).toHaveLength(5));
    await waitFor(() => expect(screen.queryByText('יש לבחור שני תאריכים')).not.toBeInTheDocument());
  });

  it('filters the template grid by date range before selecting a template', async () => {
    vi.spyOn(templateApi, 'getTemplatesSummary').mockResolvedValue({
      data: [
        { id: '1', name: 'שאלון 1', responses: 3, complete: 2, incomplete: 1 },
        { id: '2', name: 'שאלון 2', responses: 4, complete: 2, incomplete: 2 },
      ],
    } as unknown as ReturnType<typeof templateApi.getTemplatesSummary>);

    render(<Responses />);

    const firstTemplate = await screen.findByRole('heading', { name: 'שאלון 1' });
    const secondTemplate = await screen.findByRole('heading', { name: 'שאלון 2' });
    expect(firstTemplate).toBeInTheDocument();
    expect(secondTemplate).toBeInTheDocument();

    const fromInput = screen.getByLabelText('מתאריך', { selector: 'input' }) as HTMLInputElement;
    const toInput = screen.getByLabelText('עד תאריך', { selector: 'input' }) as HTMLInputElement;
    const searchButton = screen.getByRole('button', { name: 'חפש' });

    fireEvent.change(fromInput, { target: { value: '2024-09-01' } });
    fireEvent.click(searchButton);
    expect(await screen.findByText('יש לבחור שני תאריכים')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'שאלון 1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'שאלון 2' })).toBeInTheDocument();

    fireEvent.change(fromInput, { target: { value: '2024-09-01' } });
    fireEvent.change(toInput, { target: { value: '2024-09-03' } });
    fireEvent.click(searchButton);

    await waitFor(() => expect(screen.queryByText('יש לבחור שני תאריכים')).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'שאלון 1' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'שאלון 2' })).not.toBeInTheDocument();

    fireEvent.change(fromInput, { target: { value: '2024-09-06' } });
    fireEvent.change(toInput, { target: { value: '2024-09-07' } });
    fireEvent.click(searchButton);

    expect(screen.queryByRole('heading', { name: 'שאלון 1' })).not.toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'שאלון 2' })).toBeInTheDocument();

    fireEvent.change(fromInput, { target: { value: '' } });
    fireEvent.change(toInput, { target: { value: '' } });
    fireEvent.click(searchButton);

    await waitFor(() => expect(screen.queryByText('יש לבחור שני תאריכים')).not.toBeInTheDocument());
    expect(screen.getByRole('heading', { name: 'שאלון 1' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'שאלון 2' })).toBeInTheDocument();
  });

  it('opens a popup with questionnaire answers when a response is selected', async () => {
    vi.spyOn(templateApi, 'getTemplatesSummary').mockResolvedValue({
      data: [
        { id: '1', name: 'שאלון 1', responses: 1, complete: 1, incomplete: 0 },
      ],
    } as unknown as ReturnType<typeof templateApi.getTemplatesSummary>);
    const responseWithAnswers = buildResponse(1, {
      template: {
        name: 'שאלון 1',
        categories: [
          {
            name: 'כללי',
            questions: [
              { q: 'איך הולך?', qType: 'Text', choice: [], required: true, answer: 'מעולה' },
              { q: 'בחר', qType: 'Multiple', choice: ['א', 'ב'], answer: 'MULTI:["א"]' },
            ],
          },
        ],
      },
    });
    mockSingleTemplateSummaryApi([responseWithAnswers]);

    render(<Responses />);

    const templateHeading = await screen.findByRole('heading', { name: 'שאלון 1' });
    const templateCard = templateHeading.closest('[role="button"]');
    expect(templateCard).not.toBeNull();
    fireEvent.click(templateCard!);

    await waitFor(() => expect(screen.getAllByLabelText('שם המשיב')).toHaveLength(1));

    const responseRow = screen.getByRole('button', { name: /נמען 1/ });
    fireEvent.click(responseRow);

    expect(await screen.findByRole('dialog', { name: 'תשובות לשאלון' })).toBeInTheDocument();
    expect(screen.getByText(/איך הולך/)).toBeInTheDocument();
    const answerInput = screen.getByDisplayValue('מעולה') as HTMLInputElement;
    expect(answerInput).toHaveAttribute('readonly');
    const multiOption = screen.getByLabelText('א') as HTMLInputElement;
    expect(multiOption).toBeChecked();
  });
});

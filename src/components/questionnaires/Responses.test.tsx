import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Responses from './Responses';
import * as templateApi from '../../api/template';

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

  it('loads and displays mock responses when a template card is selected', async () => {
    vi.spyOn(templateApi, 'getTemplatesSummary').mockResolvedValue({
      data: [
        { id: '1', name: 'שאלון 1', responses: 3, complete: 2, incomplete: 1 },
      ],
    } as unknown as ReturnType<typeof templateApi.getTemplatesSummary>);

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

    expect(screen.getAllByText('<שם התגובה>')).toHaveLength(5);
    expect(screen.getAllByLabelText('שם המשיב').map((el) => el.textContent)).toEqual(
      expect.arrayContaining(['נמען 1', 'נמען 2', 'נמען 3', 'נמען 4', 'נמען 5']),
    );
    expect(screen.getAllByLabelText('שם מוסד').every((el) => el.textContent === '<שם בית הספר>')).toBe(true);

    const statusCells = screen.getAllByLabelText(/סטטוס תגובה/);
    expect(statusCells.every((cell) => cell.textContent === '')).toBe(true);

    expect(screen.getAllByLabelText('תאריך עדכון')[0]).toHaveTextContent('01/09/2024');
  });

  it('filters responses by completion status', async () => {
    vi.spyOn(templateApi, 'getTemplatesSummary').mockResolvedValue({
      data: [
        { id: '1', name: 'שאלון 1', responses: 3, complete: 2, incomplete: 1 },
      ],
    } as unknown as ReturnType<typeof templateApi.getTemplatesSummary>);

    render(<Responses />);

    const templateHeading = await screen.findByRole('heading', { name: 'שאלון 1' });
    const templateCard = templateHeading.closest('[role="button"]');
    expect(templateCard).not.toBeNull();
    fireEvent.click(templateCard!);

    await screen.findByRole('heading', { name: 'שאלון 1', level: 2 });
    await waitFor(() => expect(screen.getAllByText('<שם התגובה>')).toHaveLength(5));

    const completedButton = screen.getByRole('button', { name: 'הושלם' });
    fireEvent.click(completedButton);
    await waitFor(() => expect(screen.getAllByText('<שם התגובה>')).toHaveLength(3));
    expect(completedButton).toHaveAttribute('aria-pressed', 'true');

    fireEvent.click(completedButton);
    await waitFor(() => expect(screen.getAllByText('<שם התגובה>')).toHaveLength(5));
    expect(completedButton).toHaveAttribute('aria-pressed', 'false');

    const incompleteButton = screen.getByRole('button', { name: 'לא הושלם' });
    fireEvent.click(incompleteButton);
    await waitFor(() => expect(screen.getAllByText('<שם התגובה>')).toHaveLength(2));
    expect(incompleteButton).toHaveAttribute('aria-pressed', 'true');
  });
});

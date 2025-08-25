import { render, screen, fireEvent } from '@testing-library/react';
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

    expect(await screen.findByText('תגובות עבור שאלון 1')).toBeInTheDocument();
    expect(screen.getByText(/user1@example\.com/)).toBeInTheDocument();
    expect(screen.getAllByText(/"templateId":"1"/)).toHaveLength(5);
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ templateId: '123' }),
  };
});
import TemplateView from './TemplateView';
import * as templateApi from '../api/template';

vi.spyOn(templateApi, 'getTemplate').mockResolvedValue({
  data: {
    name: 'Temp',
    categories: [
      {
        name: 'Cat',
        questions: [],
        subCategories: [
          { name: 'Sub', questions: [], topics: [{ name: 'Top', questions: [] }] },
        ],
      },
    ],
  },
} as any);

describe('TemplateView expand/collapse', () => {
  it('shows topics only when subcategory is expanded', async () => {
    render(<TemplateView onBack={() => {}} />);

    // Wait for template to load
    await screen.findByText('Cat');

    // Initially, topic is not visible
    expect(screen.queryByText('Top')).not.toBeInTheDocument();

    // Expand category
    fireEvent.click(screen.getByText('Cat'));
    // Subcategory appears, but topics still hidden
    await screen.findByText('Sub');
    expect(screen.queryByText('Top')).not.toBeInTheDocument();

    // Expand subcategory
    fireEvent.click(screen.getByText('Sub'));
    await waitFor(() => expect(screen.getByText('Top')).toBeInTheDocument());

    // Collapse subcategory hides topics
    fireEvent.click(screen.getByText('Sub'));
    await waitFor(() => expect(screen.queryByText('Top')).not.toBeInTheDocument());
  });
});

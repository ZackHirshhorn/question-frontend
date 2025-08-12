import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TemplateView from './TemplateView';
import * as templateApi from '../api/template';

// Common mock template
const baseTemplate = {
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
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ templateId: '123' }),
  };
});

describe('TemplateView rename/delete', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renames a topic and persists', async () => {
    vi.spyOn(templateApi, 'getTemplate').mockResolvedValue({ data: structuredClone(baseTemplate) } as any);
    const updateSpy = vi.spyOn(templateApi, 'updateTemplate').mockResolvedValue({} as any);

    render(<TemplateView onBack={() => {}} />);

    // Expand category and subcategory
    await screen.findByText('Cat');
    fireEvent.click(screen.getByText('Cat'));
    await screen.findByText('Sub');
    fireEvent.click(screen.getByText('Sub'));
    await screen.findByText('Top');

    // Hover topic row to reveal actions, click edit (index 2)
    const topicEl = screen.getByText('Top');
    fireEvent.mouseEnter(topicEl.parentElement!);
    const wrappers = document.querySelectorAll('.icon-wrapper');
    fireEvent.click(wrappers[2] as HTMLElement);

    // Rename in popup
    const input = await screen.findByRole('textbox');
    fireEvent.change(input, { target: { value: 'TopNew' } });
    fireEvent.click(screen.getByRole('button', { name: 'שמירה' }));

    await waitFor(() => expect(updateSpy).toHaveBeenCalled());
    await screen.findByText('TopNew');
  });

  it('deletes a topic and persists', async () => {
    vi.spyOn(templateApi, 'getTemplate').mockResolvedValue({ data: structuredClone(baseTemplate) } as any);
    const updateSpy = vi.spyOn(templateApi, 'updateTemplate').mockResolvedValue({} as any);

    render(<TemplateView onBack={() => {}} />);

    await screen.findByText('Cat');
    fireEvent.click(screen.getByText('Cat'));
    await screen.findByText('Sub');
    fireEvent.click(screen.getByText('Sub'));
    await screen.findByText('Top');

    const topicEl = screen.getByText('Top');
    fireEvent.mouseEnter(topicEl.parentElement!);
    const wrappers = document.querySelectorAll('.icon-wrapper');
    // trash index 1
    fireEvent.click(wrappers[1] as HTMLElement);
    // Confirm delete
    fireEvent.click(await screen.findByRole('button', { name: 'מחיקה' }));

    await waitFor(() => expect(updateSpy).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByText('Top')).not.toBeInTheDocument());
  });

  it('renames a subcategory and persists', async () => {
    vi.spyOn(templateApi, 'getTemplate').mockResolvedValue({ data: structuredClone(baseTemplate) } as any);
    const updateSpy = vi.spyOn(templateApi, 'updateTemplate').mockResolvedValue({} as any);

    render(<TemplateView onBack={() => {}} />);

    await screen.findByText('Cat');
    fireEvent.click(screen.getByText('Cat'));
    const subEl = await screen.findByText('Sub');
    fireEvent.mouseEnter(subEl.parentElement!);
    const wrappers = document.querySelectorAll('.icon-wrapper');
    // order: plus?, trash, edit, new -> edit index 2
    fireEvent.click(wrappers[2] as HTMLElement);
    const input = await screen.findByRole('textbox');
    fireEvent.change(input, { target: { value: 'SubNew' } });
    fireEvent.click(screen.getByRole('button', { name: 'שמירה' }));

    await waitFor(() => expect(updateSpy).toHaveBeenCalled());
    await screen.findByText('SubNew');
  });

  it('deletes a category and persists', async () => {
    vi.spyOn(templateApi, 'getTemplate').mockResolvedValue({ data: structuredClone(baseTemplate) } as any);
    const updateSpy = vi.spyOn(templateApi, 'updateTemplate').mockResolvedValue({} as any);

    render(<TemplateView onBack={() => {}} />);

    const catEl = await screen.findByText('Cat');
    fireEvent.mouseEnter(catEl.parentElement!);
    const wrappers = document.querySelectorAll('.icon-wrapper');
    // category: plus?, trash, edit, new -> trash index 1
    fireEvent.click(wrappers[1] as HTMLElement);
    fireEvent.click(await screen.findByRole('button', { name: 'מחיקה' }));

    await waitFor(() => expect(updateSpy).toHaveBeenCalled());
    await waitFor(() => expect(screen.queryByText('Cat')).not.toBeInTheDocument());
  });
});


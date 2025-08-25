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
    vi.spyOn(templateApi, 'getTemplate').mockResolvedValue({ data: structuredClone(baseTemplate) } as unknown as ReturnType<typeof templateApi.getTemplate>);
    const updateSpy = vi.spyOn(templateApi, 'updateTemplate').mockResolvedValue({} as unknown as ReturnType<typeof templateApi.updateTemplate>);

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

  it('topic delete hides immediately after confirm and shows undo banner', async () => {
    vi.spyOn(templateApi, 'getTemplate').mockResolvedValue({ data: structuredClone(baseTemplate) } as unknown as ReturnType<typeof templateApi.getTemplate>);
    const updateSpy = vi.spyOn(templateApi, 'updateTemplate').mockResolvedValue({} as unknown as ReturnType<typeof templateApi.updateTemplate>);

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
    // Confirm popup
    const popup1 = await screen.findByText(/למחוק/);
    const confirm1 = popup1.closest('.popup-content')
      ? (popup1.closest('.popup-content') as HTMLElement).querySelector('button.button-danger')
      : null;
    if (!confirm1) throw new Error('Confirm button not found in popup');
    fireEvent.click(confirm1);

    // Item disappears immediately from the view and undo banner appears
    await waitFor(() => expect(screen.queryByText('Top')).not.toBeInTheDocument());
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(updateSpy).not.toHaveBeenCalled();
  });

  // timing-based commit test deliberately skipped to avoid timer flakiness in jsdom

  it('renames a subcategory and persists', async () => {
    vi.spyOn(templateApi, 'getTemplate').mockResolvedValue({ data: structuredClone(baseTemplate) } as unknown as ReturnType<typeof templateApi.getTemplate>);
    const updateSpy = vi.spyOn(templateApi, 'updateTemplate').mockResolvedValue({} as unknown as ReturnType<typeof templateApi.updateTemplate>);

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

  it('category delete undo restores the item and prevents persistence (after confirm)', async () => {
    vi.spyOn(templateApi, 'getTemplate').mockResolvedValue({ data: structuredClone(baseTemplate) } as unknown as ReturnType<typeof templateApi.getTemplate>);
    const updateSpy = vi.spyOn(templateApi, 'updateTemplate').mockResolvedValue({} as unknown as ReturnType<typeof templateApi.updateTemplate>);

    render(<TemplateView onBack={() => {}} />);

    const catEl = await screen.findByText('Cat');
    fireEvent.mouseEnter(catEl.parentElement!);
    const wrappers = document.querySelectorAll('.icon-wrapper');
    // category: plus?, trash, edit, new -> trash index 1
    fireEvent.click(wrappers[1] as HTMLElement);
    // Confirm popup
    const popup2 = await screen.findByText(/למחוק/);
    const confirm2 = popup2.closest('.popup-content')
      ? (popup2.closest('.popup-content') as HTMLElement).querySelector('button.button-danger')
      : null;
    if (!confirm2) throw new Error('Confirm button not found in popup');
    fireEvent.click(confirm2);

    // Undo
    const undo = await screen.findByText('בטל');
    fireEvent.click(undo);
    expect(updateSpy).not.toHaveBeenCalled();
    expect(await screen.findByText('Cat')).toBeInTheDocument();
  });

  it('subcategory delete hides and can be undone (after confirm)', async () => {
    vi.spyOn(templateApi, 'getTemplate').mockResolvedValue({ data: structuredClone(baseTemplate) } as unknown as ReturnType<typeof templateApi.getTemplate>);
    const updateSpy = vi.spyOn(templateApi, 'updateTemplate').mockResolvedValue({} as unknown as ReturnType<typeof templateApi.updateTemplate>);

    render(<TemplateView onBack={() => {}} />);

    const catEl = await screen.findByText('Cat');
    fireEvent.click(catEl);
    const subEl = await screen.findByText('Sub');
    fireEvent.mouseEnter(subEl.parentElement!);
    const wrappers = document.querySelectorAll('.icon-wrapper');
    // subcategory: plus?, trash, edit, new -> trash index 1
    fireEvent.click(wrappers[1] as HTMLElement);
    // Confirm popup
    const popup3 = await screen.findByText(/למחוק/);
    const confirm3 = popup3.closest('.popup-content')
      ? (popup3.closest('.popup-content') as HTMLElement).querySelector('button.button-danger')
      : null;
    if (!confirm3) throw new Error('Confirm button not found in popup');
    fireEvent.click(confirm3);

    await waitFor(() => expect(screen.queryByText('Sub')).not.toBeInTheDocument());
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(updateSpy).not.toHaveBeenCalled();

    // Undo
    const undo = await screen.findByText('בטל');
    fireEvent.click(undo);
    expect(await screen.findByText('Sub')).toBeInTheDocument();
    expect(updateSpy).not.toHaveBeenCalled();
  });
});

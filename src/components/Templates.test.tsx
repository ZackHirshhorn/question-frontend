import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Templates from './Templates';
import * as templateApi from '../api/template';

describe('Templates list', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('renders items on success', async () => {
    vi.spyOn(templateApi, 'getUserTemplates').mockResolvedValue({ data: { templates: [{ id: '1', name: 'T1' }] } } as any);
    render(<Templates onTemplateClick={() => {}} />);
    expect(await screen.findByText('T1')).toBeInTheDocument();
  });

  it('shows error on failure', async () => {
    vi.spyOn(templateApi, 'getUserTemplates').mockRejectedValue(new Error('boom'));
    render(<Templates onTemplateClick={() => {}} />);
    expect(await screen.findByText('Failed to fetch templates. Please try again later.')).toBeInTheDocument();
  });

  it('hides immediately and shows undo banner', async () => {
    vi.spyOn(templateApi, 'getUserTemplates').mockResolvedValue({ data: { templates: [{ id: '1', name: 'T1' }] } } as any);
    const delSpy = vi.spyOn(templateApi, 'deleteTemplate').mockResolvedValue({} as any);
    render(<Templates onTemplateClick={() => {}} />);
    const item = await screen.findByText('T1');
    fireEvent.mouseEnter(item.parentElement!);
    const wrappers = document.querySelectorAll('.icon-wrapper');
    fireEvent.click(wrappers[0] as HTMLElement);

    // Item disappears immediately from the list
    await waitFor(() => expect(screen.queryByText('T1')).not.toBeInTheDocument());
    // Undo banner is shown
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/T1/)).toBeInTheDocument();
    // Delete not called yet (delayed)
    expect(delSpy).not.toHaveBeenCalled();
  });

  it('undo restores the item and prevents deletion', async () => {
    vi.spyOn(templateApi, 'getUserTemplates').mockResolvedValue({ data: { templates: [{ id: '1', name: 'T1' }] } } as any);
    const delSpy = vi.spyOn(templateApi, 'deleteTemplate').mockResolvedValue({} as any);
    render(<Templates onTemplateClick={() => {}} />);
    const item = await screen.findByText('T1');
    fireEvent.mouseEnter(item.parentElement!);
    const wrappers = document.querySelectorAll('.icon-wrapper');
    fireEvent.click(wrappers[0] as HTMLElement);

    // Click undo
    const undo = await screen.findByText('בטל');
    fireEvent.click(undo);
    // Ensure API was not called
    expect(delSpy).not.toHaveBeenCalled();
    // Item restored
    expect(await screen.findByText('T1')).toBeInTheDocument();
  });

  it('opens create template popup', async () => {
    vi.spyOn(templateApi, 'getUserTemplates').mockResolvedValue({ data: { templates: [] } } as any);
    render(<Templates onTemplateClick={() => {}} />);
    const btn = await screen.findByRole('button', { name: 'שאלון חדש' });
    fireEvent.click(btn);
    expect(await screen.findByText('יצירת שאלון חדש')).toBeInTheDocument();
  });
});

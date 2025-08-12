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

  it('deletes a template from the list', async () => {
    vi.spyOn(templateApi, 'getUserTemplates').mockResolvedValue({ data: { templates: [{ id: '1', name: 'T1' }] } } as any);
    const delSpy = vi.spyOn(templateApi, 'deleteTemplate').mockResolvedValue({} as any);
    render(<Templates onTemplateClick={() => {}} />);
    const item = await screen.findByText('T1');
    fireEvent.mouseEnter(item.parentElement!);
    const wrappers = document.querySelectorAll('.icon-wrapper');
    fireEvent.click(wrappers[0] as HTMLElement);
    await waitFor(() => expect(delSpy).toHaveBeenCalledWith('1'));
    await waitFor(() => expect(screen.queryByText('T1')).not.toBeInTheDocument());
  });

  it('opens create template popup', async () => {
    vi.spyOn(templateApi, 'getUserTemplates').mockResolvedValue({ data: { templates: [] } } as any);
    render(<Templates onTemplateClick={() => {}} />);
    const btn = await screen.findByRole('button', { name: 'שאלון חדש' });
    fireEvent.click(btn);
    expect(await screen.findByText('יצירת שאלון חדש')).toBeInTheDocument();
  });
});

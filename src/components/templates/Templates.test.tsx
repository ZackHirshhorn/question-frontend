import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Templates from './Templates';
import * as templateApi from '../../api/template';

describe('Templates list', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('renders items on success', async () => {
    vi.spyOn(templateApi, 'getUserTemplates').mockResolvedValue({ data: { templates: [{ id: '1', name: 'T1' }] } } as unknown as ReturnType<typeof templateApi.getUserTemplates>);
    render(<Templates onTemplateClick={() => {}} />);
    expect(await screen.findByText('T1')).toBeInTheDocument();
  });

  it('shows error on failure', async () => {
    vi.spyOn(templateApi, 'getUserTemplates').mockRejectedValue(new Error('boom'));
    render(<Templates onTemplateClick={() => {}} />);
    expect(await screen.findByText('Failed to fetch templates. Please try again later.')).toBeInTheDocument();
  });

  it('hides immediately after confirm and shows undo banner', async () => {
    vi.spyOn(templateApi, 'getUserTemplates').mockResolvedValue({ data: { templates: [{ id: '1', name: 'T1' }] } } as unknown as ReturnType<typeof templateApi.getUserTemplates>);
    const delSpy = vi.spyOn(templateApi, 'deleteTemplate').mockResolvedValue({} as unknown as ReturnType<typeof templateApi.deleteTemplate>);
    render(<Templates onTemplateClick={() => {}} />);
    const item = await screen.findByText('T1');
    fireEvent.mouseEnter(item.parentElement!);
    const deleteIcon = await screen.findByTestId('delete-icon');
    fireEvent.click(deleteIcon.parentElement as HTMLElement);
    // Confirm delete in popup (scope within popup)
    const popup = await screen.findByText(/למחוק/);
    const confirm = popup.closest('.popup-content')
      ? (popup.closest('.popup-content') as HTMLElement).querySelector('button.button-danger')
      : null;
    if (!confirm) throw new Error('Confirm button not found in popup');
    fireEvent.click(confirm);

    // Item disappears immediately from the list
    await waitFor(() => expect(screen.queryByText('T1')).not.toBeInTheDocument());
    // Undo banner is shown
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText(/T1/)).toBeInTheDocument();
    // Delete not called yet (delayed)
    expect(delSpy).not.toHaveBeenCalled();
  });

  it('undo restores the item and prevents deletion after confirm', async () => {
    vi.spyOn(templateApi, 'getUserTemplates').mockResolvedValue({ data: { templates: [{ id: '1', name: 'T1' }] } } as unknown as ReturnType<typeof templateApi.getUserTemplates>);
    const delSpy = vi.spyOn(templateApi, 'deleteTemplate').mockResolvedValue({} as unknown as ReturnType<typeof templateApi.deleteTemplate>);
    render(<Templates onTemplateClick={() => {}} />);
    const item = await screen.findByText('T1');
    fireEvent.mouseEnter(item.parentElement!);
    const deleteIcon = await screen.findByTestId('delete-icon');
    fireEvent.click(deleteIcon.parentElement as HTMLElement);
    // Confirm delete in popup (scope within popup)
    const popup = await screen.findByText(/למחוק/);
    const confirm = popup.closest('.popup-content')
      ? (popup.closest('.popup-content') as HTMLElement).querySelector('button.button-danger')
      : null;
    if (!confirm) throw new Error('Confirm button not found in popup');
    fireEvent.click(confirm);

    // Click undo
    const undo = await screen.findByText('בטל');
    fireEvent.click(undo);
    // Ensure API was not called
    expect(delSpy).not.toHaveBeenCalled();
    // Item restored
    expect(await screen.findByText('T1')).toBeInTheDocument();
  });

  it('opens create template popup', async () => {
    vi.spyOn(templateApi, 'getUserTemplates').mockResolvedValue({ data: { templates: [] } } as unknown as ReturnType<typeof templateApi.getUserTemplates>);
    render(<Templates onTemplateClick={() => {}} />);
    const btn = await screen.findByRole('button', { name: 'שאלון חדש' });
    fireEvent.click(btn);
    expect(await screen.findByText('יצירת שאלון חדש')).toBeInTheDocument();
  });

  it('renames a template via pencil icon and persists full payload', async () => {
    const getUserSpy = vi.spyOn(templateApi, 'getUserTemplates');
    getUserSpy.mockResolvedValueOnce({ data: { templates: [{ id: '1', name: 'T1' }] } } as unknown as ReturnType<typeof templateApi.getUserTemplates>);
    vi.spyOn(templateApi, 'getTemplate').mockResolvedValue({ data: { name: 'T1', categories: [] } } as unknown as ReturnType<typeof templateApi.getTemplate>);
    const updateSpy = vi.spyOn(templateApi, 'updateTemplate').mockResolvedValue({} as unknown as ReturnType<typeof templateApi.updateTemplate>);
    // After successful rename, the component refreshes list; return the new name
    getUserSpy.mockResolvedValueOnce({ data: { templates: [{ id: '1', name: 'T1 Renamed' }] } } as unknown as ReturnType<typeof templateApi.getUserTemplates>);

    render(<Templates onTemplateClick={() => {}} />);
    const item = await screen.findByText('T1');
    // Hover to reveal icons
    fireEvent.mouseEnter(item.parentElement!);
    const editIcon = await screen.findByTestId('edit-icon');
    fireEvent.click(editIcon.parentElement as HTMLElement);

    // Popup appears
    expect(await screen.findByText('שינוי שם שאלון')).toBeInTheDocument();
    const input = screen.getByLabelText('שם חדש') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'T1 Renamed' } });
    const save = screen.getByRole('button', { name: 'שמירה' });
    fireEvent.click(save);

    // updateTemplate called with full payload including categories array
    await waitFor(() => expect(updateSpy).toHaveBeenCalled());
    const [idArg, payloadArg] = updateSpy.mock.calls[0];
    expect(idArg).toBe('1');
    expect(payloadArg).toMatchObject({ name: 'T1 Renamed', categories: expect.any(Array) });
    // UI updates after refresh
    expect(await screen.findByText('T1 Renamed')).toBeInTheDocument();
  });
});

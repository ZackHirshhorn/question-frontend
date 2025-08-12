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

describe('TemplateView create category', () => {
  it('calls updateTemplate when creating a new category', async () => {
    vi.spyOn(templateApi, 'getTemplate').mockResolvedValue({
      data: { name: 'Temp', categories: [] },
    } as any);
    const updateSpy = vi.spyOn(templateApi, 'updateTemplate').mockResolvedValue({} as any);

    render(<TemplateView onBack={() => {}} />);

    await screen.findByText('Temp');
    fireEvent.click(screen.getByRole('button', { name: 'קטגוריה חדשה' }));

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'NewCat' } });
    fireEvent.click(screen.getByRole('button', { name: 'יצירה' }));

    await waitFor(() => expect(updateSpy).toHaveBeenCalled());
    const [id, payload] = updateSpy.mock.calls[0];
    expect(id).toBe('123');
    expect(payload.categories.some((c: any) => c.name === 'NewCat')).toBe(true);
  });
});

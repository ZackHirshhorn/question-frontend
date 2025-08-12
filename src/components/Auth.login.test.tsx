import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store';
import Auth from './Auth';
import * as authApi from '../api/auth';

describe('Auth login flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('logs in and redirects on success', async () => {
    vi.spyOn(authApi, 'login').mockResolvedValue({ data: { id: '1', name: 'U', email: 'u@e.com', role: 'user' } } as any);

    // Allow assigning location
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: '' },
    });

    render(
      <Provider store={store}>
        <Auth />
      </Provider>
    );

    fireEvent.change(screen.getByLabelText('דוא"ל:'), { target: { value: 'u@e.com' } });
    fireEvent.change(screen.getByLabelText('סיסמה:'), { target: { value: 'pw' } });
    fireEvent.click(screen.getByRole('button', { name: 'התחברות' }));

    await waitFor(() => expect(localStorage.getItem('user')).toContain('u@e.com'));
    expect(window.location.href).toBe('/');
  });

  it('shows server error on login failure', async () => {
    vi.spyOn(authApi, 'login').mockRejectedValue({ response: { data: { message: 'Bad creds' } } });

    render(
      <Provider store={store}>
        <Auth />
      </Provider>
    );

    fireEvent.change(screen.getByLabelText('דוא"ל:'), { target: { value: 'x@e.com' } });
    fireEvent.change(screen.getByLabelText('סיסמה:'), { target: { value: 'pw' } });
    fireEvent.click(screen.getByRole('button', { name: 'התחברות' }));

    expect(await screen.findByText('Bad creds')).toBeInTheDocument();
  });
});


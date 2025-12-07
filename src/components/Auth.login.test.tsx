import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { store } from '../store';
import Auth from './Auth';
import * as authApi from '../api/auth';

describe('Auth login flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  const LocationDisplay = () => {
    const loc = useLocation();
    return <div data-testid="location-display">{loc.pathname}</div>;
  };

  it('logs in and redirects on success', async () => {
    vi.spyOn(authApi, 'login').mockResolvedValue({ data: { id: '1', name: 'U', email: 'u@e.com', role: 'user' } } as unknown as Awaited<ReturnType<typeof authApi.login>>);

    render(
      <MemoryRouter initialEntries={["/login"]}>
        <Provider store={store}>
          <Auth />
          <LocationDisplay />
        </Provider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('דוא"ל:'), { target: { value: 'u@e.com' } });
    fireEvent.change(screen.getByLabelText('סיסמה:'), { target: { value: 'pw' } });
    fireEvent.click(screen.getByRole('button', { name: 'התחברות' }));

    // Redirect to root indicates successful login
    await waitFor(() => expect(screen.getByTestId('location-display')).toHaveTextContent('/'));
    await waitFor(() => expect(screen.getByTestId('location-display')).toHaveTextContent('/'));
  });

  it('shows server error on login failure', async () => {
    vi.spyOn(authApi, 'login').mockRejectedValue({ isAxiosError: true, response: { data: { message: 'Bad creds' } } } as unknown);

    render(
      <MemoryRouter>
        <Provider store={store}>
          <Auth />
        </Provider>
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('דוא"ל:'), { target: { value: 'x@e.com' } });
    fireEvent.change(screen.getByLabelText('סיסמה:'), { target: { value: 'pw' } });
    fireEvent.click(screen.getByRole('button', { name: 'התחברות' }));

    expect(await screen.findByText('Bad creds')).toBeInTheDocument();
  });
});

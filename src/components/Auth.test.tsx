import { render, screen, within, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { store } from '../store';
import Auth from './Auth';
import * as authApi from '../api/auth';
import { vi } from 'vitest';

vi.mock('../api/auth');

describe('Auth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders the login form by default', () => {
    render(
      <Provider store={store}>
        <Auth />
      </Provider>
    );

    // Check for the tab buttons
    const tabContainer = screen.getByRole('tablist');
    expect(within(tabContainer).getByRole('tab', { name: 'התחברות' })).toBeInTheDocument();
    expect(within(tabContainer).getByRole('tab', { name: 'הרשמה' })).toBeInTheDocument();


    // Check that the login form is visible
    expect(screen.getByLabelText('דוא"ל:')).toBeInTheDocument();
    expect(screen.getByLabelText('סיסמה:')).toBeInTheDocument();
  });

  test('shows the register form with password confirmation when the register tab is clicked', () => {
    render(
      <Provider store={store}>
        <Auth />
      </Provider>
    );

    const registerTab = screen.getByRole('tab', { name: 'הרשמה' });
    fireEvent.click(registerTab);

    expect(screen.getByLabelText('שם:')).toBeInTheDocument();
    expect(screen.getByLabelText('דוא"ל:')).toBeInTheDocument();
    expect(screen.getByLabelText('סיסמה:')).toBeInTheDocument();
    expect(screen.getByLabelText('אישור סיסמה:')).toBeInTheDocument();
  });

  test('does not submit the form when passwords do not match', async () => {
    const registerMock = vi.spyOn(authApi, 'register');

    render(
      <Provider store={store}>
        <Auth />
      </Provider>
    );

    const registerTab = screen.getByRole('tab', { name: 'הרשמה' });
    fireEvent.click(registerTab);

    const passwordInput = screen.getByLabelText('סיסמה:');
    const confirmPasswordInput = screen.getByLabelText('אישור סיסמה:');
    const registerButton = screen.getByRole('button', { name: 'הרשמה' });

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password456' } });
    fireEvent.click(registerButton);

    expect(registerMock).not.toHaveBeenCalled();
  });

  test('submits the form when passwords match', async () => {
    const registerMock = vi.spyOn(authApi, 'register').mockResolvedValue({ data: {} });

    render(
      <Provider store={store}>
        <Auth />
      </Provider>
    );

    const registerTab = screen.getByRole('tab', { name: 'הרשמה' });
    fireEvent.click(registerTab);

    const nameInput = screen.getByLabelText('שם:');
    const emailInput = screen.getByLabelText('דוא"ל:');
    const passwordInput = screen.getByLabelText('סיסמה:');
    const confirmPasswordInput = screen.getByLabelText('אישור סיסמה:');
    const registerButton = screen.getByRole('button', { name: 'הרשמה' });

    fireEvent.change(nameInput, { target: { value: 'Test User' } });
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });
});


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
    expect(within(tabContainer).getByRole('tab', { name: /login/i })).toBeInTheDocument();
    expect(within(tabContainer).getByRole('tab', { name: /register/i })).toBeInTheDocument();


    // Check that the login form is visible
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  test('shows the register form with password confirmation when the register tab is clicked', () => {
    render(
      <Provider store={store}>
        <Auth />
      </Provider>
    );

    const registerTab = screen.getByRole('tab', { name: /register/i });
    fireEvent.click(registerTab);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
  });

  test('does not submit the form when passwords do not match', async () => {
    const registerMock = vi.spyOn(authApi, 'register');

    render(
      <Provider store={store}>
        <Auth />
      </Provider>
    );

    const registerTab = screen.getByRole('tab', { name: /register/i });
    fireEvent.click(registerTab);

    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

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

    const registerTab = screen.getByRole('tab', { name: /register/i });
    fireEvent.click(registerTab);

    const nameInput = screen.getByLabelText(/name/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/^password/i);
    const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
    const registerButton = screen.getByRole('button', { name: /register/i });

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


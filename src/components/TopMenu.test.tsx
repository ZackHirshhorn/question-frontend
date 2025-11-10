import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react';
import TopMenu from './TopMenu';

describe('TopMenu', () => {
  it('opens dropdown, invokes logout, and closes on outside click', async () => {
    const onLogin = vi.fn();
    const onLogout = vi.fn();
    render(<TopMenu isLoggedIn={true} onLogin={onLogin} onLogout={onLogout} />);

    const clickable = await waitForClickable();
    await act(async () => {
      clickable.click();
    });

    const logoutItem = await screen.findByText('התנתקות');
    fireEvent.click(logoutItem);
    expect(onLogout).toHaveBeenCalledTimes(1);

    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('התנתקות')).toBeNull();
  });

  it('shows login action when logged out and calls handler', async () => {
    const onLogin = vi.fn();
    const onLogout = vi.fn();
    render(<TopMenu isLoggedIn={false} onLogin={onLogin} onLogout={onLogout} />);

    const clickable = await waitForClickable();
    await act(async () => {
      clickable.click();
    });

    const loginItem = await screen.findByText('Login');
    fireEvent.click(loginItem);
    expect(onLogin).toHaveBeenCalledTimes(1);
  });
});

async function waitForClickable() {
  return waitFor(() => {
    const el = document.querySelector('div[style*="cursor: pointer"]');
    if (!el) {
      throw new Error('Menu toggle not found yet');
    }
    return el as HTMLElement;
  });
}

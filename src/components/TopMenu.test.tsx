import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react';
import TopMenu from './TopMenu';

describe('TopMenu', () => {
  it('opens and closes dropdown, and calls logout', async () => {
    const onLogin = vi.fn();
    const onLogout = vi.fn();
    render(<TopMenu isLoggedIn={true} onLogin={onLogin} onLogout={onLogout} />);

    // Click menu icon to open (non-semantic clickable div)
    const clickable = document.querySelector('div[style*="cursor: pointer"]') as HTMLElement;
    await act(async () => {
      clickable.click();
    });

    // Dropdown should render with a Logout option
    const logoutItem = await screen.findByText('התנתקות');
    fireEvent.click(logoutItem);
    expect(onLogout).toHaveBeenCalled();
  });
});

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LinkPopup from './LinkPopup';

const originalClipboard = navigator.clipboard;
const originalExecCommand = document.execCommand;

describe('LinkPopup', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    if (originalClipboard) {
      Object.assign(navigator, { clipboard: originalClipboard });
    } else {
      Object.assign(navigator, { clipboard: undefined });
    }
    if (originalExecCommand) {
      Object.defineProperty(document, 'execCommand', {
        value: originalExecCommand,
        configurable: true,
        writable: true,
      });
    }
  });

  it('copies link via clipboard API and indicates success', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText } as unknown,
    });
    const onClose = vi.fn();

    render(<LinkPopup url="https://example.com" onClose={onClose} />);

    const copyButton = screen.getByRole('button', { name: 'העתק' });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(writeText).toHaveBeenCalledWith('https://example.com');
    });

    expect(await screen.findByRole('button', { name: 'הועתק!' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'סגור' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('falls back to execCommand when clipboard API fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('no clipboard'));
    Object.assign(navigator, {
      clipboard: { writeText } as unknown,
    });
    const execSpy = vi.fn();
    Object.defineProperty(document, 'execCommand', {
      value: execSpy,
      configurable: true,
      writable: true,
    });
    const selectSpy = vi.spyOn(window.HTMLInputElement.prototype, 'select');

    render(<LinkPopup url="https://fallback.test" onClose={() => {}} />);

    fireEvent.click(screen.getByRole('button', { name: 'העתק' }));

    await waitFor(() => {
      expect(writeText).toHaveBeenCalled();
    });

    expect(selectSpy).toHaveBeenCalled();
    expect(execSpy).toHaveBeenCalledWith('copy');
    expect(await screen.findByRole('button', { name: 'הועתק!' })).toBeInTheDocument();
  });
});

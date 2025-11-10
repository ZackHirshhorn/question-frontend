import React, { StrictMode } from 'react';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { Provider } from 'react-redux';

vi.mock('./App', () => ({
  default: () => <div data-testid="app-shell" />,
}));

describe('main entry point bootstrap', () => {
  beforeEach(() => {
    vi.resetModules();
    document.body.innerHTML = '<div id="root"></div>';
  });

  it('mounts the React app with the expected provider stack', async () => {
    const renderMock = vi.fn();
    const createRootMock = vi.fn(() => ({ render: renderMock }));

    vi.doMock('react-dom/client', () => ({
      createRoot: createRootMock,
    }));

    const { store } = await import('./store');
    await import('./main');

    const host = document.getElementById('root');
    expect(createRootMock).toHaveBeenCalledWith(host);
    expect(renderMock).toHaveBeenCalledTimes(1);

    const tree = renderMock.mock.calls[0][0] as React.ReactElement;
    expect(tree.type).toBe(StrictMode);

    const provider = tree.props.children as React.ReactElement;
    expect(provider.type).toBe(Provider);
    expect(provider.props.store).toBe(store);

    const router = provider.props.children as React.ReactElement;
    expect(router.props.children.type).toBeDefined();
  });
});

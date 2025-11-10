import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import type { Mock } from 'vitest';
import App from './App';
import userReducer from './store/userSlice';
import questionCollectionsReducer from './store/questionCollectionsSlice';
import { headUserTemplates } from './api/template';
import { logout as logoutApi } from './api/auth';

vi.mock('./api/template', async (importOriginal) => {
  const actual = await importOriginal<typeof import('./api/template')>();
  return {
    ...actual,
    headUserTemplates: vi.fn(),
    getUserTemplates: vi.fn().mockResolvedValue({ data: { templates: [] } }),
    getTemplate: vi.fn().mockResolvedValue({ data: { template: { categories: [] } } }),
    updateTemplate: vi.fn().mockResolvedValue(undefined),
    deleteTemplate: vi.fn().mockResolvedValue(undefined),
  };
});

vi.mock('./api/auth', () => ({
  logout: vi.fn(),
}));

type UserPreloaded = {
  user: {
    user: null | { id: string; name: string; email: string; role: string };
    isAuthenticated: boolean;
  };
  questionCollections: {
    items: unknown[];
    loading: boolean;
    error: string | null;
    allNames: string[];
  };
};

const baseState: UserPreloaded = {
  user: {
    user: null,
    isAuthenticated: false,
  },
  questionCollections: {
    items: [],
    loading: false,
    error: null,
    allNames: [],
  },
};

function renderWithProviders({
  initialEntries = ['/templates'],
  preloadedState,
}: {
  initialEntries?: string[];
  preloadedState?: Partial<UserPreloaded>;
} = {}) {
  const store = configureStore({
    reducer: {
      user: userReducer,
      questionCollections: questionCollectionsReducer,
    },
    preloadedState: {
      user: { ...baseState.user, ...(preloadedState?.user ?? {}) },
      questionCollections: {
        ...baseState.questionCollections,
        ...(preloadedState?.questionCollections ?? {}),
      },
    } as UserPreloaded,
  });

  const result = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>
        <App />
      </MemoryRouter>
    </Provider>
  );

  return { store, ...result };
}

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('authenticates user when session probe succeeds', async () => {
    (headUserTemplates as Mock).mockResolvedValue(undefined);

    const { store } = renderWithProviders();

    await waitFor(() => {
      expect(headUserTemplates).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(store.getState().user.isAuthenticated).toBe(true);
    });

    const toggle = await waitForMenuToggle();
    fireEvent.click(toggle);
    expect(await screen.findByText('התנתקות')).toBeInTheDocument();
  });

  it('redirects to login when session probe fails', async () => {
    (headUserTemplates as Mock).mockRejectedValue(new Error('no session'));

    renderWithProviders({ initialEntries: ['/templates'] });

    expect(await screen.findByRole('button', { name: 'התחברות' })).toBeInTheDocument();
    expect(headUserTemplates).toHaveBeenCalled();
  });

  it('logs out via TopMenu action', async () => {
    (headUserTemplates as Mock).mockResolvedValue(undefined);
    (logoutApi as Mock).mockResolvedValue(undefined);

    const { store } = renderWithProviders({
      initialEntries: ['/templates'],
      preloadedState: {
        user: {
          isAuthenticated: true,
          user: { id: '1', name: 'Test', email: 'test@example.com', role: 'admin' },
        },
      },
    });

    const toggle = await waitForMenuToggle();
    fireEvent.click(toggle);

    const logoutButton = await screen.findByText('התנתקות');
    fireEvent.click(logoutButton);

    await waitFor(() => {
      expect(logoutApi).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(store.getState().user.isAuthenticated).toBe(false);
    });

    await waitFor(() => {
      expect(document.querySelector('div[style*="cursor: pointer"]')).toBeNull();
    });
  });
});

async function waitForMenuToggle() {
  return waitFor(() => {
    const el = document.querySelector('div[style*="cursor: pointer"]');
    if (!el) {
      throw new Error('Menu toggle not found');
    }
    return el as HTMLElement;
  });
}

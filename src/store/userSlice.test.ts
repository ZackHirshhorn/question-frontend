import { describe, it, expect, beforeEach, vi } from 'vitest';
import reducer, { loginSuccess, logout } from './userSlice';

describe('userSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('handles loginSuccess and persists to localStorage', () => {
    const initialState = { user: null, isAuthenticated: false };
    const user = { id: '1', name: 'A', email: 'a@example.com', role: 'user' };
    const state = reducer(initialState as any, loginSuccess({ user }));
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(user);
    expect(JSON.parse(localStorage.getItem('user') || 'null')).toEqual(user);
  });

  it('handles logout and clears localStorage', () => {
    const user = { id: '1', name: 'A', email: 'a@example.com', role: 'user' };
    const loggedIn = reducer({ user, isAuthenticated: true } as any, logout());
    expect(loggedIn.isAuthenticated).toBe(false);
    expect(loggedIn.user).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});


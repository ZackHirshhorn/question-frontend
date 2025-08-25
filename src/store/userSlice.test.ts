import { describe, it, expect, beforeEach } from 'vitest';
import reducer, { loginSuccess, logout } from './userSlice';

describe('userSlice', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('handles loginSuccess (in-memory only)', () => {
    const initialState: { user: null; isAuthenticated: boolean } = { user: null, isAuthenticated: false };
    const user = { id: '1', name: 'A', email: 'a@example.com', role: 'user' };
    const state = reducer(initialState, loginSuccess({ user }));
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(user);
    expect(localStorage.getItem('user')).toBeNull();
  });

  it('handles logout and clears localStorage', () => {
    const user = { id: '1', name: 'A', email: 'a@example.com', role: 'user' };
    const loggedIn = reducer({ user, isAuthenticated: true }, logout());
    expect(loggedIn.isAuthenticated).toBe(false);
    expect(loggedIn.user).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
  });
});
